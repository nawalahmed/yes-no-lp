import type { LibSQLClient } from "./db";

export async function initSchema(db: LibSQLClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      recipient_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      question TEXT NOT NULL,
      dodge_button TEXT NOT NULL,
      answer TEXT,
      created_at INTEGER NOT NULL,
      answered_at INTEGER
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      email TEXT NOT NULL,
      source TEXT NOT NULL,
      subscribed_at INTEGER NOT NULL,
      PRIMARY KEY (email, source)
    )
  `);
}
