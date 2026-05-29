// src/components/GuessHistoryList.tsx
"use client";

import { useState } from "react";
import type { GuessEntry } from "../types";

const COLOR_MAP = {
  luntian: {
    bg: "rgba(74,142,93,0.15)",
    border: "#4A8E5D55",
    text: "#4A8E5D",
    label: "Napakalapit",
  },
  dilaw: {
    bg: "rgba(249,168,38,0.12)",
    border: "#F9A82655",
    text: "#F9A826",
    label: "Malapit-lapit",
  },
  pula: {
    bg: "rgba(174,67,58,0.15)",
    border: "#AE433A55",
    text: "#AE433A",
    label: "Malayo",
  },
};

interface GuessHistoryListProps {
  guesses: GuessEntry[];
}

export function GuessHistoryList({
  guesses,
}: GuessHistoryListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (guesses.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-2"
      role="list"
      aria-label="Kasaysayan ng mga hula"
    >
      {guesses.map((g) => {
        const colors = COLOR_MAP[g.color];
        const isExpanded = expanded === g.id;

        return (
          <div
            key={g.id}
            className="rounded-xl overflow-hidden animate-fade-in transition-all"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
            role="listitem"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() =>
                setExpanded(isExpanded ? null : g.id)
              }
              aria-expanded={isExpanded}
              aria-label={`${g.word}, ranggo ${g.rank}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-lg"
                  style={{ color: "var(--text-cream)" }}
                >
                  {g.word}
                </span>

                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: colors.border,
                    color: colors.text,
                  }}
                >
                  {colors.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="font-display text-2xl font-bold tabular-nums"
                  style={{ color: colors.text }}
                >
                  #{g.rank}
                </span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: isExpanded
                      ? "rotate(180deg)"
                      : undefined,
                    transition: "transform 0.2s",
                    color: "var(--text-muted)",
                  }}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>

            {isExpanded && g.definition && (
              <div
                className="px-4 pb-3 text-sm animate-fade-in"
                style={{
                  color: "var(--text-muted)",
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <p className="pt-2">
                  <span style={{ color: colors.text }}>
                    Kahulugan:
                  </span>{" "}
                  {g.definition}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}