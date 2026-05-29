// src/app/admin/page.tsx
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "../../lib/firebase/admin";
import { AdminDashboard } from "../../components/admin/AdminDashboard";
import type { AdminStats, UserProfile } from "../../types";
import { redirect } from "next/navigation";

async function getAdminData(): Promise<AdminStats | null> {
  const cookieStore = await cookies(); // ✅ FIX HERE
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }

  const usersSnap = await adminDb.collection("users").get();
  const users = usersSnap.docs.map((d) => d.data() as UserProfile);

  const today = new Date().toISOString().split("T")[0];

  return {
    totalUsers: users.length,
    activeTodayCount: users.filter((u) => u.lastPlayedDate === today).length,
    avgGuessCount: 0,
    topStreakUsers: users
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 10)
      .map(({ uid, displayName, currentStreak }) => ({
        uid,
        displayName,
        currentStreak,
      })),
  };
}

export default async function AdminPage() {
  const stats = await getAdminData();

  if (!stats) redirect("/login?next=/admin");

  return <AdminDashboard stats={stats} />;
}