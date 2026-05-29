// scripts/seedDailyWord.ts
/**
 * Usage:
 *   npx tsx scripts/seedDailyWord.ts --word=diwa --date=2024-01-15
 *
 * Requires FIREBASE_ADMIN_* env vars to be set.
 * This script NEVER stores the plaintext word in Firestore.
 */

import { createHash } from "crypto";
import * as admin from "firebase-admin";
import { MOCK_WORD_DB } from "../lib/wordService";

const SALT = process.env.WORD_SALT ?? "salindiwa_2024_ph_salt_x9k2";

function hashWord(word: string): string {
  return createHash("sha256")
    .update(SALT + word.toLowerCase().trim())
    .digest("hex");
}

// Build a proximity rank index for all 50 mock words
// In production, this would be built from your full word vector database
function buildWordIndex(): Record<string, number> {
  const index: Record<string, number> = {};
  for (const [word, data] of Object.entries(MOCK_WORD_DB)) {
    index[word] = data.baseProximityScore;
  }
  return index;
}

async function seedDailyWord(word: string, date: string) {
  // Validate word exists in the vocabulary
  const normalizedWord = word.toLowerCase().trim();
  if (!MOCK_WORD_DB[normalizedWord]) {
    throw new Error(
      `"${word}" ay hindi nahanap sa vocabulary. Idagdag ito sa MOCK_WORD_DB muna.`
    );
  }

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = admin.firestore();
  const wordHash = hashWord(normalizedWord);
  const wordIndex = buildWordIndex();

  const docRef = db.collection("daily_words").doc(date);
  const existing = await docRef.get();

  if (existing.exists) {
    console.warn(`⚠ Mayroon nang salita para sa ${date}. I-override?`);
    // Add --force flag check in production
  }

  await docRef.set({
    date,
    wordHash,        // SHA-256 hash only — NEVER plaintext
    wordIndex,       // word → proximity rank mapping (no secret revealed here)
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    totalPlayers: 0,
  });

  console.log(`✓ Na-seed ang salita para sa ${date}`);
  console.log(`  Hash: ${wordHash.slice(0, 16)}...`);
  console.log(`  Vocabulary size: ${Object.keys(wordIndex).length} salita`);
}

// Parse CLI args
const args = process.argv.slice(2).reduce<Record<string, string>>((acc, arg) => {
  const [k, v] = arg.replace("--", "").split("=");
  acc[k] = v;
  return acc;
}, {});

if (!args.word || !args.date) {
  console.error("Usage: npx tsx scripts/seedDailyWord.ts --word=salita --date=YYYY-MM-DD");
  process.exit(1);
}

seedDailyWord(args.word, args.date)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });