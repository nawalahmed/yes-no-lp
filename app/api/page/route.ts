import { NextResponse } from "next/server";
import { getPageById } from "../../../lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") || "").trim();

  if (!id) return new NextResponse("Missing id", { status: 400 });

  const page = getPageById(id);
  if (!page) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ question: page.question });
}
