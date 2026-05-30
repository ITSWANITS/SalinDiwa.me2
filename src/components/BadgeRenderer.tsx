"use client";
import type { RankDefinition, SubTier } from "@/types";
import { RANK_DEFINITIONS, SUB_TIER_LABELS } from "@/lib/rankEngine";

interface BadgeRendererProps {
  level: number;
  subTier?: SubTier;
  size?: "sm" | "md" | "lg";
}

export function BadgeRenderer({ level, subTier, size = "md" }: BadgeRendererProps) {
  const rank = RANK_DEFINITIONS[Math.min(level - 1, RANK_DEFINITIONS.length - 1)];
  const isSupreme = level >= 10 && subTier;
  const label = isSupreme ? SUB_TIER_LABELS[subTier!] : null;
  const sizeMap = { sm: 48, md: 72, lg: 108 };
  const px = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={px} height={px} viewBox="0 0 100 100" aria-label={`Badge: ${rank.title}`} style={{ filter: `drop-shadow(0 0 ${px / 8}px ${rank.glowColor}66)` }}>
        <circle cx="50" cy="50" r="42" fill={rank.color + "22"} stroke={rank.color} strokeWidth="2" />
        <circle cx="50" cy="50" r="30" fill={rank.color + "33"} />
        <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="bold" fill={rank.color}>{level}</text>
      </svg>
      <span className="font-display text-center" style={{ color: label?.color ?? rank.color, fontSize: size === "sm" ? "0.7rem" : "0.85rem" }}>
        {label?.title ?? rank.title}
      </span>
    </div>
  );
}
