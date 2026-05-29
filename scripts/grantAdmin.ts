// scripts/grantAdmin.ts
/**
 * One-time script to grant admin role to a Firebase user.
 * Usage: npx tsx scripts/grantAdmin.ts --uid=USER_UID_HERE
 */
import * as admin from "firebase-admin";

async function grantAdmin(uid: string) {
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

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, { admin: true });

  // Update Firestore role field
  await db.collection("users").doc(uid).update({ role: "admin" });

  // Force token refresh on next sign-in by revoking existing tokens
  await admin.auth().revokeRefreshTokens(uid);

  console.log(`✓ Admin role granted to ${uid}`);
  console.log("  User must sign out and back in for changes to take effect.");
}

const args = process.argv.slice(2).reduce<Record<string, string>>((acc, arg) => {
  const [k, v] = arg.replace("--", "").split("=");
  acc[k] = v;
  return acc;
}, {});

if (!args.uid) {
  console.error("Usage: npx tsx scripts/grantAdmin.ts --uid=USER_UID_HERE");
  process.exit(1);
}

grantAdmin(args.uid)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });