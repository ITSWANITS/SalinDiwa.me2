// types/index.ts

export type ProximityColor = "luntian" | "dilaw" | "pula";

export type SubTier = "karangalan" | "kadakilaan" | "kamatayan";

export interface GuessEntry {
  id: string;
  word: string;
  rank: number;
  color: ProximityColor;
  definition: string | null;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  totalWins: number;
  rankLevel: number; // 1–10
  rankSubTier?: SubTier; // only relevant at level 10
  lastPlayedDate: string | null;
  role: "user" | "admin";
}

export interface RankDefinition {
  level: number;
  title: string;
  titleEn: string;
  requiredStreaks: number;
  color: string;
  glowColor: string;
  badgeVariant: "basic" | "mid" | "advanced" | "elite" | "supreme";
}

export interface DailyWord {
  id: string;
  date: string; // YYYY-MM-DD
  wordHash: string; // SHA-256 hash — never plaintext
  totalPlayers: number;
}

export interface AdminStats {
  totalUsers: number;
  activeTodayCount: number;
  avgGuessCount: number;
  topStreakUsers: Pick<
    UserProfile,
    "uid" | "displayName" | "currentStreak"
  >[];
}
