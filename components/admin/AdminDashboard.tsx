"use client";

import { useState } from "react";
import type { AdminStats } from "../../types";
import { WordScheduler } from "./WordScheduler";

type Tab = "overview" | "users" | "words";

interface Props {
  stats: AdminStats;
}

export function AdminDashboard({ stats }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [resetTarget, setResetTarget] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  }

  async function handleResetStreak() {
    if (!resetTarget.trim()) return;

    const res = await fetch("/api/admin/reset-streak", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUid: resetTarget }),
    });

    const data = await res.json();

    setResetMsg(
      res.ok ? "✓ Na-reset na ang streak." : data.error ?? "May error."
    );

    setResetTarget("");
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "8px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    border: "none",
    background: tab === t ? "rgba(201,168,76,0.2)" : "transparent",
    color: tab === t ? "#C9A84C" : "var(--text-muted)",
    transition: "all 0.15s",
  });

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{ background: "var(--bg-primary)", color: "var(--text-cream)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-display text-3xl"
            style={{ color: "#C9A84C", textShadow: "0 0 24px rgba(201,168,76,0.25)" }}
          >
            SalinDiwa
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Admin Dashboard
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 rounded-lg transition-all"
          style={{
            background: "rgba(174,67,58,0.15)",
            border: "1px solid rgba(174,67,58,0.3)",
            color: "#AE433A",
          }}
        >
          Mag-logout
        </button>
      </header>

      {/* Tab navigation */}
      <nav
        className="flex gap-1 mb-8 p-1 rounded-xl w-fit"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        role="tablist"
      >
        {(["overview", "users", "words"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={tabStyle(t)}
            role="tab"
            aria-selected={tab === t}
          >
            {t === "overview"
              ? "Pangkalahatang-tanaw"
              : t === "users"
              ? "Mga User"
              : "Mga Salita"}
          </button>
        ))}
      </nav>

      {/* Overview */}
      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Kabuuang Mga User", value: stats.totalUsers, color: "#C9A84C" },
              { label: "Aktibo Ngayon", value: stats.activeTodayCount, color: "#4A8E5D" },
              { label: "Avg. Bilang ng Hula", value: stats.avgGuessCount || "—", color: "#F9A826" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
                <p className="font-display text-5xl" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Reset */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2 className="font-display text-lg mb-4">Mabilis na Aksyon</h2>

            <div className="flex gap-2 max-w-sm">
              <input
                value={resetTarget}
                onChange={(e) => setResetTarget(e.target.value)}
                placeholder="Firebase UID..."
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-cream)",
                }}
              />

              <button
                onClick={handleResetStreak}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: "#AE433A", color: "#fff" }}
              >
                I-reset
              </button>
            </div>

            {resetMsg && (
              <p
                className="text-xs mt-2"
                style={{ color: resetMsg.startsWith("✓") ? "#4A8E5D" : "#AE433A" }}
              >
                {resetMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <h2 className="font-display text-lg">Top Streak Leaderboard</h2>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr>
                {["#", "Pangalan", "Streak", "UID", "Aksyon"].map((h) => (
                  <th key={h} className="text-left px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {stats.topStreakUsers.map((u, i) => (
                <tr key={u.uid}>
                  <td className="px-6 py-4">#{i + 1}</td>
                  <td className="px-6 py-4">{u.displayName}</td>
                  <td className="px-6 py-4">{u.currentStreak} 🔥</td>
                  <td className="px-6 py-4">{u.uid.slice(0, 12)}…</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={async () => {
                        if (!confirm(`I-reset ang streak ni ${u.displayName}?`)) return;

                        await fetch("/api/admin/reset-streak", {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ targetUid: u.uid }),
                        });
                      }}
                      style={{
                        background: "rgba(174,67,58,0.15)",
                        color: "#AE433A",
                        border: "1px solid rgba(174,67,58,0.25)",
                      }}
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Words */}
      {tab === "words" && <WordScheduler />}
    </div>
  );
}