// src/lib/authService.ts (server-side)
import { adminAuth, adminDb } from "./firebase/admin";
import { NextRequest } from "next/server";
import type { UserProfile } from "../types";

/**
 * Verify Firebase ID token from Authorization header.
 * Returns decoded token or null.
 */
export async function verifyIdToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify token AND require admin role.
 * Role is stored in Firebase custom claims AND Firestore document.
 */
export async function requireAdmin(req: NextRequest) {
  const decoded = await verifyIdToken(req);
  if (!decoded) return null;

  // Check custom claims (fast path)
  if ((decoded as any).admin === true) return decoded;

  // Fallback: Firestore role check
  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists) return null;

  const data = userDoc.data() as UserProfile;
  if (data.role !== "admin") return null;

  return decoded;
}

/**
 * Grant admin role (SECURE: server-only usage)
 */
export async function grantAdminRole(uid: string) {
  await adminAuth.setCustomUserClaims(uid, { admin: true });
  await adminDb.collection("users").doc(uid).update({ role: "admin" });
}