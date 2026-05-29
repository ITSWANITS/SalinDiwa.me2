import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const {
    FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY,
  } = process.env;
  if (
    !FIREBASE_ADMIN_PROJECT_ID ||
    !FIREBASE_ADMIN_CLIENT_EMAIL ||
    !FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    throw new Error("Missing Firebase Admin environment variables");
  }
  return initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);