// src/components/UserRankCard.tsx
"use client";

import { useAuth } from "../providers/authProvider";
import { BadgeRenderer } from "./BadgeRenderer";
import {
  progressToNextRank,
  RANK_DEFINITIONS,
  SUB_TIER_LABELS,
} from "../lib/rankEngine";

export function UserRankCard() {
  const { profile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          height: 120,
        }}
      />
    );
  }

  if (!profile) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <p
          className="text-sm mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Mag-login para ma-track ang iyong progreso
        </p>

        <a
          href="/login"
          className="text-sm px-4 py-2 rounded-lg inline-block transition-all"
          style={{
            background: "#C9A84C22",
            color: "#C9A84C",
            border: "1px solid #C9A84C44",
          }}
        >
          Mag-login
        </a>
      </div>
    );
  }

  const rank =
    RANK_DEFINITIONS[profile.rankLevel - 1] ??
    RANK_DEFINITIONS[0];

  const nextRank =
    RANK_DEFINITIONS[profile.rankLevel] ?? null;

  const progress = progressToNextRank(
    profile.totalWins,
    profile.rankLevel
  );

  const isSupreme =
    profile.rankLevel >= 10 &&
    !!profile.rankSubTier;

  const subTierLabel =
    isSupreme && profile.rankSubTier
      ? SUB_TIER_LABELS[profile.rankSubTier]
      : null;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <BadgeRenderer
            level={profile.rankLevel}
            subTier={profile.rankSubTier}
            size="md"
          />

          <div>
            <p
              className="font-display text-lg leading-tight"
              style={{
                color:
                  subTierLabel?.color ??
                  rank.color,
              }}
            >
              {subTierLabel?.title ??
                rank.title}
            </p>

            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
              }}
            >
              {profile.displayName}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs px-3 py-1 rounded-lg transition-all"
          style={{
            background:
              "rgba(255,255,255,0.04)",
            border:
              "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Streak",
            value: `${profile.currentStreak} 🔥`,
          },
          {
            label: "Pinaka-mahaba",
            value: profile.longestStreak,
          },
          {
            label: "Kabuuang Panalo",
            value: profile.totalWins,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-2 text-center"
            style={{
              background:
                "rgba(255,255,255,0.03)",
            }}
          >
            <p
              className="font-display text-xl"
              style={{
                color: "var(--text-cream)",
              }}
            >
              {value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {profile.rankLevel < 10 && nextRank && (
        <div>
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span>{rank.title}</span>
            <span>{nextRank.title}</span>
          </div>

          <div
            className="rounded-full overflow-hidden"
            style={{
              background:
                "rgba(255,255,255,0.07)",
              height: 6,
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`,
              }}
            />
          </div>

          <p
            className="text-xs mt-1 text-right"
            style={{ color: "var(--text-muted)" }}
          >
            {profile.totalWins} /{" "}
            {nextRank.requiredStreaks} panalo
          </p>
        </div>
      )}

      {/* Max rank */}
      {profile.rankLevel >= 10 && (
        <div
          className="rounded-lg p-2 text-center text-xs"
          style={{
            background:
              "rgba(201,168,76,0.08)",
            border:
              "1px solid rgba(201,168,76,0.2)",
            color: "#C9A84C",
          }}
        >
          ✦ Pinakamataas na antas — patuloy na
          maglaro para paunlarin ang sub-tier
        </div>
      )}
    </div>
  );
}