import { NextResponse } from "next/server";
import { createPage } from "../../../lib/store";

export async function POST(req: Request) {
    console.log("API /create hit");

  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid JSON", { status: 400 });

  const question = String(body.question || "").trim();
  if (!question) return new NextResponse("Missing question", { status: 400 });

  const record = createPage(question);
  return NextResponse.json({ id: record.id });
}
