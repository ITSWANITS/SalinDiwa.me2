// src/app/api/admin/words/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { requireAdmin } from "../../../../lib/authService";
import { sanitizeInput, hashWord, MOCK_WORD_DB } from "../../../../lib/wordService";
import { z } from "zod";

const WordSchema = z.object({
  word: z.string().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET: list all scheduled daily words (hashes only)
export async function GET(req: NextRequest) {
  const decoded = await requireAdmin(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const snap = await adminDb
    .collection("daily_words")
    .orderBy("date", "desc")
    .limit(60)
    .get();

  const words = snap.docs.map((d) => {
    const data = d.data();
    return {
      date: data.date,
      wordHash: data.wordHash,
      totalPlayers: data.totalPlayers ?? 0,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ words });
}

// POST: schedule a new daily word
export async function POST(req: NextRequest) {
  const decoded = await requireAdmin(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = WordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Maling input." }, { status: 400 });
  }

  const word = sanitizeInput(parsed.data.word);
  const { date } = parsed.data;

  // Validate word is in vocabulary
  if (!MOCK_WORD_DB[word]) {
    return NextResponse.json(
      { error: `"${word}" ay hindi nahanap sa vocabulary.` },
      { status: 422 }
    );
  }

  const wordHash = hashWord(word);

  // Build proximity index
  const wordIndex: Record<string, number> = {};
  for (const [w, data] of Object.entries(MOCK_WORD_DB)) {
    wordIndex[w] = data.baseProximityScore;
  }

  const docRef = adminDb.collection("daily_words").doc(date);
  const existing = await docRef.get();
  if (existing.exists) {
    return NextResponse.json(
      { error: `Mayroon nang salita para sa ${date}.` },
      { status: 409 }
    );
  }

  await docRef.set({
    date,
    wordHash,
    wordIndex,
    totalPlayers: 0,
    scheduledBy: decoded.uid,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, wordHash: wordHash.slice(0, 14) + "…" });
}