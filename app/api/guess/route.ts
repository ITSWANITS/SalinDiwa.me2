// src/app/api/guess/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { verifyIdToken } from "../../../lib/authService";
import { sanitizeInput, verifyGuess, lookupDefinition } from "../../../lib/wordService";
import { applyWin } from "../../../lib/rankEngine";
import type { UserProfile, GuessEntry } from "../../../types";
import { z } from "zod";

// Input validation schema
const GuessSchema = z.object({
  word: z.string().min(1).max(64),
  botToken: z.string().min(1), // micro-captcha token
  timestamp: z.number().int(),
});

// Simple in-memory rate limiter (use Redis/Upstash in production)
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 30) return false; // max 30 guesses/minute
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Masyadong maraming hula. Sandali lang." },
      { status: 429 }
    );
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Maling format ng kahilingan." }, { status: 400 });
  }

  const parsed = GuessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Maling input." }, { status: 400 });
  }

  const { word: rawWord, botToken, timestamp } = parsed.data;

  // Bot token validation: timestamp must be within 5 minutes
  const age = Date.now() - timestamp;
  if (age > 300_000 || age < 0) {
    return NextResponse.json({ error: "Expired na token." }, { status: 400 });
  }
  // Validate bot token format (simple HMAC-style check)
  if (!botToken.startsWith("sd_") || botToken.length < 20) {
    return NextResponse.json({ error: "Bot detected." }, { status: 403 });
  }

  // Sanitize
  const word = sanitizeInput(rawWord);
  if (!word) {
    return NextResponse.json({ error: "Walang laman ang salita." }, { status: 400 });
  }

  // Get today's word hash from Firestore
  const today = new Date().toISOString().split("T")[0];
  const wordDoc = await adminDb.collection("daily_words").doc(today).get();

  if (!wordDoc.exists) {
    return NextResponse.json({ error: "Walang salita ngayon." }, { status: 404 });
  }

  const { wordHash, wordIndex } = wordDoc.data() as {
    wordHash: string;
    wordIndex: Record<string, number>; // word → proximity rank
  };

  // Check if correct
  const isCorrect = verifyGuess(word, wordHash);

  // Get proximity rank
  const rank = wordIndex[word] ?? -1; // -1 means word not in vocabulary

  if (rank === -1) {
    return NextResponse.json({
      valid: false,
      error: "Hindi nahanap ang salitang ito sa diksyonaryo.",
    }, { status: 422 });
  }

  // Lookup definition
  const definition = await lookupDefinition(word);

  // Determine color
  const color =
    rank <= 300 ? "luntian" :
    rank <= 1500 ? "dilaw" :
    "pula";

  // If correct, update user stats (requires auth)
  if (isCorrect) {
    const decoded = await verifyIdToken(req);
    if (decoded) {
      const userRef = adminDb.collection("users").doc(decoded.uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const user = userDoc.data() as UserProfile;
        const updates = applyWin(user);
        await userRef.update(updates);
      }
    }
  }

  const entry: Omit<GuessEntry, "id"> = {
    word,
    rank,
    color,
    definition,
    timestamp: Date.now(),
  };

  return NextResponse.json({
    valid: true,
    correct: isCorrect,
    entry,
    message: isCorrect ? "Tama! Nahulaan mo ang Salita ng Araw!" : null,
  });
}