import { NextResponse } from "next/server";
import { getPageById } from "../../../lib/db-operations";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") || "").trim();

  if (!id) return new NextResponse("Missing id", { status: 400 });

  const page = await getPageById(id);
  if (!page) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({
    // Your client uses data.name
    name: page.recipient_name || "",
    // Your client uses data.question
    question: page.question || "",
    // Your client uses data.dodgeButton
    dodgeButton: page.dodge_button === "yes" ? "yes" : "no",
  });
}
