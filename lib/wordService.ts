// src/lib/wordService.ts
import { createHash } from "crypto";

const SALT = process.env.WORD_SALT ?? "salindiwa_fallback_salt";

/**
 * Hash the secret word. NEVER send plaintext to the client.
 */
export function hashWord(word: string): string {
  return createHash("sha256")
    .update(SALT + word.toLowerCase().trim())
    .digest("hex");
}

/**
 * Compare guess to stored hash (constant-time).
 */
export function verifyGuess(guess: string, storedHash: string): boolean {
  const guessHash = hashWord(guess);

  if (guessHash.length !== storedHash.length) return false;

  let result = 0;
  for (let i = 0; i < guessHash.length; i++) {
    result |= guessHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Sanitize user input.
 */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, "")
    .trim()
    .toLowerCase()
    .slice(0, 64);
}

/**
 * Word definition lookup (mock + optional API).
 */
export async function lookupDefinition(word: string): Promise<string | null> {
  try {
    const mockResult = MOCK_WORD_DB[word.toLowerCase()];
    if (mockResult) return mockResult.definition;

    const res = await fetch(
      `https://diksyonaryo.ph/search?q=${encodeURIComponent(word)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/<p class="definition">([\s\S]*?)<\/p>/);
    
    return match ? match[1].replace(/<[^>]*>/g, "").trim() : null;
  } catch {
    return null;
  }
}

/* =========================
   TYPES (FIX IS HERE)
========================= */

export type WordData = {
  definition: string;
  baseProximityScore: number;
};

export const MOCK_WORD_DB: Record<string, WordData> = {
  diwa: {
    definition: "Pag-iisip; kaluluwa; kaibuturan ng isang bagay o kaisipan.",
    baseProximityScore: 1,
  },
  salita: {
    definition: "Yunit ng wika na may kahulugan; tunog na may kahulugan.",
    baseProximityScore: 5,
  },
  isip: {
    definition: "Kakayahang mag-aral at umunawa; kaisipan.",
    baseProximityScore: 12,
  },
  pagmamahal: {
    definition: "Malalim na pagmamahal; pagnanais ng kabutihan para sa isa.",
    baseProximityScore: 24,
  },
  buhay: {
    definition: "Kalagayan ng pagiging buháy; existensya.",
    baseProximityScore: 35,
  },
  puso: {
    definition: "Ang organ na nagpapump ng dugo; sentro ng damdamin.",
    baseProximityScore: 48,
  },
  ganda: {
    definition: "Katangiang kaakit-akit sa paningin o pandama.",
    baseProximityScore: 67,
  },
  mundo: {
    definition: "Ang kalupaan; sanlibutan; lahat ng bagay sa kalikasan.",
    baseProximityScore: 89,
  },
  oras: {
    definition: "Yunit ng panahon na katumbas ng animnapung minuto.",
    baseProximityScore: 112,
  },
  tao: {
    definition: "Makatwirang nilalang; miyembro ng sangkatauhan.",
    baseProximityScore: 134,
  },
  // ... keep the rest EXACTLY the same pattern ...
};