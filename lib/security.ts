// src/lib/security.ts
// Centralized security utilities referenced throughout the app

/**
 * RATE LIMITING
 * In production, replace the in-memory Map with Upstash Redis:
 *
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(30, "60 s"),
 *   });
 *
 *   const { success } = await ratelimit.limit(ip);
 */

/**
 * BOT TOKEN VALIDATION
 * The current micro-captcha uses a time-bound client-generated token.
 * For stronger protection, integrate Cloudflare Turnstile:
 *
 *   const result = await fetch(
 *     "https://challenges.cloudflare.com/turnstile/v0/siteverify",
 *     { method: "POST", body: JSON.stringify({
 *       secret: process.env.TURNSTILE_SECRET,
 *       response: turnstileToken
 *     })}
 *   );
 *
 * Add NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET to .env
 */

/**
 * LOGGING ADMIN ACTIONS (audit trail)
 */
import { adminDb } from "./firebase/admin";

export async function logAdminAction(
  performedBy: string,
  action: string,
  targetUid?: string
) {
  await adminDb.collection("admin_logs").add({
    performedBy,
    action,
    targetUid: targetUid ?? null,
    timestamp: new Date().toISOString(),
  });
}

/**
 * ENVIRONMENT VALIDATION
 * Call this at app startup to catch missing secrets early.
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "WORD_SALT",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
