// src/lib/rankEngine.ts
import type { RankDefinition, SubTier, UserProfile } from "../types";

// Each rank requires cumulative streak count to unlock
export const RANK_DEFINITIONS: RankDefinition[] = [
  {
    level: 1,
    title: "Baguhan",
    titleEn: "Beginner",
    requiredStreaks: 0,
    color: "#8B7355",
    glowColor: "#8B7355",
    badgeVariant: "basic",
  },
  {
    level: 2,
    title: "Mag-aaral",
    titleEn: "Student",
    requiredStreaks: 3,
    color: "#A0896E",
    glowColor: "#A0896E",
    badgeVariant: "basic",
  },
  {
    level: 3,
    title: "Marunong",
    titleEn: "Knowledgeable",
    requiredStreaks: 7,
    color: "#4A8E5D",
    glowColor: "#4A8E5D",
    badgeVariant: "basic",
  },
  {
    level: 4,
    title: "Bihasang-Bihasa",
    titleEn: "Proficient",
    requiredStreaks: 14,
    color: "#3A7D8E",
    glowColor: "#3A7D8E",
    badgeVariant: "mid",
  },
  {
    level: 5,
    title: "Dalubhasa",
    titleEn: "Expert",
    requiredStreaks: 25,
    color: "#5B6EBF",
    glowColor: "#5B6EBF",
    badgeVariant: "mid",
  },
  {
    level: 6,
    title: "Manunulat",
    titleEn: "Wordsmith",
    requiredStreaks: 40,
    color: "#8B5CF6",
    glowColor: "#8B5CF6",
    badgeVariant: "mid",
  },
  {
    level: 7,
    title: "Tagapagturo",
    titleEn: "Sage",
    requiredStreaks: 60,
    color: "#C9A84C",
    glowColor: "#C9A84C",
    badgeVariant: "advanced",
  },
  {
    level: 8,
    title: "Diwang-Diwa",
    titleEn: "Spirit-Touched",
    requiredStreaks: 85,
    color: "#E07B39",
    glowColor: "#E07B39",
    badgeVariant: "advanced",
  },
  {
    level: 9,
    title: "Hari ng Salita",
    titleEn: "Word Sovereign",
    requiredStreaks: 120,
    color: "#D4476E",
    glowColor: "#D4476E",
    badgeVariant: "elite",
  },
  {
    level: 10,
    title: "Diwa Supremo",
    titleEn: "Supreme Essence",
    requiredStreaks: 175,
    color: "#C9A84C",
    glowColor: "#FFD700",
    badgeVariant: "supreme",
  },
];

export const SUB_TIER_THRESHOLDS: Record<SubTier, number> = {
  karangalan: 175,
  kadakilaan: 250,
  kamatayan: 375,
};

export const SUB_TIER_LABELS: Record<
  SubTier,
  { title: string; titleEn: string; color: string }
> = {
  karangalan: { title: "Karangalang Diwa", titleEn: "Diwa of Honor", color: "#C9A84C" },
  kadakilaan: { title: "Kadakilaan Diwa", titleEn: "Diwa of Glory", color: "#E8C97A" },
  kamatayan: { title: "Kamatayan Diwa", titleEn: "Immortal Diwa", color: "#FFFFFF" },
};

export function computeRankLevel(totalWins: number): number {
  let level = 1;

  for (const rank of RANK_DEFINITIONS) {
    if (totalWins >= rank.requiredStreaks) {
      level = rank.level;
    }
  }

  return level;
}

export function computeSubTier(totalWins: number): SubTier {
  if (totalWins >= SUB_TIER_THRESHOLDS.kamatayan) return "kamatayan";
  if (totalWins >= SUB_TIER_THRESHOLDS.kadakilaan) return "kadakilaan";
  return "karangalan";
}

export function progressToNextRank(totalWins: number, currentLevel: number): number {
  if (currentLevel >= 10) {
    const current = totalWins - SUB_TIER_THRESHOLDS.karangalan;
    const total = SUB_TIER_THRESHOLDS.kamatayan - SUB_TIER_THRESHOLDS.karangalan;
    return Math.min(100, Math.round((current / total) * 100));
  }

  const currentRank = RANK_DEFINITIONS[currentLevel - 1];
  const nextRank = RANK_DEFINITIONS[currentLevel];

  if (!nextRank || !currentRank) return 100;

  const progress = totalWins - currentRank.requiredStreaks;
  const needed = nextRank.requiredStreaks - currentRank.requiredStreaks;

  return Math.min(100, Math.round((progress / needed) * 100));
}

export function applyWin(user: UserProfile): Partial<UserProfile> {
  const newTotalWins = user.totalWins + 1;
  const newStreak = user.currentStreak + 1;
  const newLevel = computeRankLevel(newTotalWins);

  const updates: Partial<UserProfile> = {
    totalWins: newTotalWins,
    currentStreak: newStreak,
    longestStreak: Math.max(user.longestStreak, newStreak),
    rankLevel: newLevel,
    lastPlayedDate: new Date().toISOString().split("T")[0],
  };

  if (newLevel >= 10) {
    updates.rankSubTier = computeSubTier(newTotalWins);
  }

  return updates;
}

export function breakStreak(user: UserProfile): Partial<UserProfile> {
  return {
    currentStreak: 0,
    lastPlayedDate: new Date().toISOString().split("T")[0],
  };
}