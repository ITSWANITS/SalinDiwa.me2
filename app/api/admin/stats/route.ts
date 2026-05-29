// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { requireAdmin } from "../../../../lib/authService";
import type { AdminStats, UserProfile } from "../../../../types";

export async function GET(req: NextRequest) {
  const decoded = await requireAdmin(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const usersSnap = await adminDb.collection("users").get();
  const users = usersSnap.docs.map((d) => d.data() as UserProfile);

  const today = new Date().toISOString().split("T")[0];
  const activeToday = users.filter((u) => u.lastPlayedDate === today).length;

  const topStreakUsers = users
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 10)
    .map(({ uid, displayName, currentStreak }) => ({
      uid, displayName, currentStreak,
    }));

  const stats: AdminStats = {
    totalUsers: users.length,
    activeTodayCount: activeToday,
    avgGuessCount: 0, // Extend by querying guesses collection
    topStreakUsers,
  };

  return NextResponse.json(stats);
}