import { adminDb } from "../lib/firebase/admin";
import { hashWord } from "../lib/wordService";

const args = process.argv.slice(2);

const wordArg = args.find((a) => a.startsWith("--word="));
const dateArg = args.find((a) => a.startsWith("--date="));

if (!wordArg || !dateArg) {
  throw new Error("Missing arguments");
}

const word = wordArg.replace("--word=", "");
const date = dateArg.replace("--date=", "");

async function main() {
  await adminDb.collection("daily_words").doc(date).set({
    date,
    wordHash: hashWord(word),
    totalPlayers: 0,
    createdAt: new Date().toISOString(),
  });

  console.log("Seed successful");
}

main();