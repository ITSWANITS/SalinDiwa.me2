import "dotenv/config";
import { adminAuth, adminDb } from "../lib/firebase/admin";

const args = process.argv.slice(2).reduce<Record<string, string>>((acc, arg) => {
  const [k, v] = arg.replace("--", "").split("=");
  acc[k] = v;
  return acc;
}, {});

const uid = args.uid;

if (!uid) {
  console.error("Usage: npx tsx scripts/grantAdmin.ts --uid=USER_UID");
  process.exit(1);
}

async function run() {
  await adminAuth.setCustomUserClaims(uid, { admin: true });

  await adminDb.collection("users").doc(uid).set(
    { role: "admin" },
    { merge: true }
  );

  await adminAuth.revokeRefreshTokens(uid);

  console.log(`✓ Admin granted to ${uid}`);
}

run().catch(console.error);