// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";
import type { UserProfile } from "../../../../types";

const RegisterSchema = z.object({
  idToken: z.string().min(1),
  displayName: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const { idToken, displayName } = parsed.data;

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const existing = await userRef.get();

  if (existing.exists) {
    // Already registered — just return their profile
    return NextResponse.json({ profile: existing.data() });
  }

  const newProfile: UserProfile = {
    uid: decoded.uid,
    email: decoded.email ?? "",
    displayName: displayName.slice(0, 40),
    currentStreak: 0,
    longestStreak: 0,
    totalWins: 0,
    rankLevel: 1,
    rankSubTier: undefined,
    lastPlayedDate: null,
    role: "user",
  };

  await userRef.set(newProfile);

  return NextResponse.json({ profile: newProfile }, { status: 201 });
}