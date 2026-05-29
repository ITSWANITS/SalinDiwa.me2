import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { adminDb } from "../lib/firebase/admin";
import { hashWord } from "../lib/wordService";

const args = process.argv.slice(2);

const word = args.find((a) => a.startsWith("--word="))?.replace("--word=", "");
const date = args.find((a) => a.startsWith("--date="))?.replace("--date=", "");

if (!word || !date) {
  throw new Error("Missing arguments");
}

async function main() {
  await adminDb.collection("daily_words").doc(date).set({
    date,
    wordHash: hashWord(word),
    totalPlayers: 0,
    createdAt: new Date().toISOString(),
  });

  console.log("Seed successful");
}

main().catch(console.error);