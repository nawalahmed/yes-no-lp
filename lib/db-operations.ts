import { getDb } from "./db";

function randomId(len = 10) {
  const cryptoObj: Crypto | undefined =
    (globalThis as any).crypto || (globalThis as any).webcrypto;

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(len);
    cryptoObj.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
    return out;
  }

  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export interface PageRecord {
  id: string;
  recipient_name: string;
  sender_email: string;
  question: string;
  dodge_button: "yes" | "no";
  answer: "yes" | "no" | null;
  created_at: number;
  answered_at: number | null;
}

export interface EmailSubscriptionRecord {
  email: string;
  source: string;
  subscribed_at: number;
}

function asNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeEmail(v: unknown) {
  return String(v || "").trim().toLowerCase();
}

export async function createPageInDb(
  question: string,
  recipientName: string,
  senderEmail: string,
  dodgeButton: "yes" | "no"
): Promise<PageRecord> {
  const db = await getDb();

  const id = randomId(10);
  const now = Date.now();

  const q = String(question || "").trim();
  const rn = String(recipientName || "").trim();
  const se = normalizeEmail(senderEmail);
  const dbtn = dodgeButton === "no" ? "no" : "yes";

  await db.execute({
    sql: `
      INSERT INTO pages (id, recipient_name, sender_email, question, dodge_button, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [id, rn, se, q, dbtn, now],
  });

  return {
    id,
    recipient_name: rn,
    sender_email: se,
    question: q,
    dodge_button: dbtn,
    answer: null,
    created_at: now,
    answered_at: null,
  };
}

export async function getPageById(id: string): Promise<PageRecord | null> {
  const db = await getDb();

  const cleanId = String(id || "").trim();
  if (!cleanId) return null;

  const result = await db.execute({
    sql: `SELECT * FROM pages WHERE id = ? LIMIT 1`,
    args: [cleanId],
  });

  const row = (result as any)?.rows?.[0];
  if (!row) return null;

  return {
    id: String(row.id),
    recipient_name: String(row.recipient_name),
    sender_email: normalizeEmail(row.sender_email),
    question: String(row.question),
    dodge_button: (row.dodge_button === "no" ? "no" : "yes") as "yes" | "no",
    answer:
      row.answer === "yes" || row.answer === "no" ? (row.answer as "yes" | "no") : null,
    created_at: asNumber(row.created_at),
    answered_at: row.answered_at == null ? null : asNumber(row.answered_at),
  };
}

export async function setAnswerInDb(id: string, answer: "yes" | "no"): Promise<boolean> {
  const db = await getDb();
  const now = Date.now();

  const cleanId = String(id || "").trim();
  const a = answer === "no" ? "no" : "yes";
  if (!cleanId) return false;

  const result = await db.execute({
    sql: `UPDATE pages SET answer = ?, answered_at = ? WHERE id = ?`,
    args: [a, now, cleanId],
  });

  const rowsAffected = (result as any)?.rowsAffected;
  return typeof rowsAffected === "number" ? rowsAffected > 0 : false;
}

export async function saveEmailSubscription(
  email: string,
  source: string
): Promise<{ success: boolean; duplicate?: boolean }> {
  const db = await getDb();
  const now = Date.now();

  const cleanEmail = normalizeEmail(email);
  const cleanSource = String(source || "").trim() || "subscribe";
  if (!cleanEmail) return { success: false };

  try {
    await db.execute({
      sql: `
        INSERT INTO email_subscriptions (email, source, subscribed_at)
        VALUES (?, ?, ?)
      `,
      args: [cleanEmail, cleanSource, now],
    });

    return { success: true };
  } catch (e: any) {
    const message = String(e?.message || "");
    const causeMessage = String(e?.cause?.message || "");
    const code = String(e?.code || e?.cause?.code || "");
    const haystack = (message + " " + causeMessage + " " + code).toLowerCase();

    const isDuplicate =
      haystack.includes("unique constraint") ||
      haystack.includes("sqlite_constraint") ||
      haystack.includes("constraint_unique") ||
      haystack.includes("already exists") ||
      haystack.includes("constraint failed");

    if (isDuplicate) return { success: false, duplicate: true };
    throw e;
  }
}

/**
 * Needed for Option 1. verify subscription exists in DB
 * Make sure you have a unique index on email_subscriptions.email
 */
export async function getSubscriptionByEmail(
  email: string
): Promise<EmailSubscriptionRecord | null> {
  const db = await getDb();

  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  const result = await db.execute({
    sql: `SELECT email, source, subscribed_at FROM email_subscriptions WHERE email = ? LIMIT 1`,
    args: [cleanEmail],
  });

  const row = (result as any)?.rows?.[0];
  if (!row) return null;

  return {
    email: normalizeEmail(row.email),
    source: String(row.source || ""),
    subscribed_at: asNumber(row.subscribed_at),
  };
}
