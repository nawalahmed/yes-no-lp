import { NextResponse } from "next/server";
import { setAnswer } from "../../../lib/store";

export async function GET() {
  return NextResponse.json({ ok: true, route: "answer" });
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id") || "").trim();
  const answer = String(form.get("answer") || "").trim();

  if (!id) return new NextResponse("Missing id", { status: 400 });
  if (answer !== "yes" && answer !== "no") return new NextResponse("Invalid answer", { status: 400 });

  const updated = setAnswer(id, answer as "yes" | "no");
  if (!updated) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ ok: true });
}
