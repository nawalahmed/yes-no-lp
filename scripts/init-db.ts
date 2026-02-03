import { getDb } from "../lib/db";
import { initSchema } from "../lib/db-schema";

async function init() {
  console.log("Initializing database...");
  const db = await getDb();
  await initSchema(db);
  console.log("Database initialized successfully!");
}

init().catch(console.error);
