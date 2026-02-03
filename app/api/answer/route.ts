import { NextResponse } from "next/server";
import { setAnswerInDb } from "../../../lib/db-operations";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, route: "answer" });
}

async function readBody(req: Request): Promise<{ id: string; answer: string }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return {
      id: String((body as any).id || "").trim(),
      answer: String((body as any).answer || "").trim(),
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return {
      id: String(params.get("id") || "").trim(),
      answer: String(params.get("answer") || "").trim(),
    };
  }

  // Default. multipart/form-data or others
  const form = await req.formData();
  return {
    id: String(form.get("id") || "").trim(),
    answer: String(form.get("answer") || "").trim(),
  };
}

export async function POST(req: Request) {
  const { id, answer } = await readBody(req);

  if (!id) return new NextResponse("Missing id", { status: 400 });
  if (answer !== "yes" && answer !== "no")
    return new NextResponse("Invalid answer", { status: 400 });

  const updated = await setAnswerInDb(id, answer as "yes" | "no");
  if (!updated) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ ok: true });
}
