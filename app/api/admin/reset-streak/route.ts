// src/app/api/admin/reset-streak/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { requireAdmin } from "../../../../lib/authService";
import { z } from "zod";

const ResetSchema = z.object({ targetUid: z.string().min(1) });

export async function POST(req: NextRequest) {
  const decoded = await requireAdmin(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await adminDb.collection("users").doc(parsed.data.targetUid).update({
    currentStreak: 0,
  });

  return NextResponse.json({ success: true });
}