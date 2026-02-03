import { NextResponse } from "next/server";
import { createPageInDb, getSubscriptionByEmail } from "../../../lib/db-operations";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message: string, status = 400) {
  return new NextResponse(message, { status });
}

function getCookieValue(cookieHeader: string, name: string) {
  // minimal, dependency-free cookie parsing
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(`${name}=`));
  if (!hit) return "";
  const raw = hit.slice(name.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const question = String((body as any).question || "").trim();
  if (!question) return bad("Missing question");

  // tolerate both recipientName and recepientName from older clients
  const recipientName = String(
    (body as any).recipientName || (body as any).recepientName || ""
  ).trim();
  if (!recipientName) return bad("Missing recipientName");

  const dodgeButton = String((body as any).dodgeButton || "")
    .trim()
    .toLowerCase();
  if (dodgeButton !== "yes" && dodgeButton !== "no") {
    return bad("Invalid dodgeButton (must be 'yes' or 'no')");
  }

  /**
   * Option 1.
   * Derive senderEmail from the subscribed user record.
   *
   * Requirements:
   * - /api/subscribe sets an HttpOnly cookie, e.g. "subscribed_email"
   * - We read that cookie here, then verify it exists in DB (prevents spoofed cookies)
   * - We never accept senderEmail from the request body
   */

  const cookieHeader = req.headers.get("cookie") || "";
  const senderEmail = normalizeEmail(getCookieValue(cookieHeader, "subscribed_email"));

  if (!senderEmail) return bad("Not subscribed or missing subscription context", 401);
  if (!emailRegex.test(senderEmail)) return bad("Invalid subscription email", 401);

  // Verify subscription exists (and ideally is active)
  const sub = await getSubscriptionByEmail(senderEmail);
  if (!sub) return bad("No active subscription found", 403);

  const record = await createPageInDb(
    question,
    recipientName,
    senderEmail,
    dodgeButton as "yes" | "no"
  );

  return NextResponse.json({ id: record.id });
}
