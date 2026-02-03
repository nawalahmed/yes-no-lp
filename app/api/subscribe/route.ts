import { NextResponse } from "next/server";
import { saveEmailSubscription } from "../../../lib/db-operations";

type Payload = { email?: string; source?: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readPayload(req: Request): Promise<Payload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as Payload | null;
    return json ?? {};
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await req.formData().catch(() => null);
    if (!form) return {};

    const email = form.get("email");
    const source = form.get("source");

    return {
      email: typeof email === "string" ? email : "",
      source: typeof source === "string" ? source : "",
    };
  }

  const json = (await req.json().catch(() => null)) as Payload | null;
  if (json) return json;

  const form = await req.formData().catch(() => null);
  if (!form) return {};

  const email = form.get("email");
  const source = form.get("source");

  return {
    email: typeof email === "string" ? email : "",
    source: typeof source === "string" ? source : "",
  };
}

export async function POST(req: Request) {
  try {
    console.log("subscribe: hit", {
      method: req.method,
      contentType: req.headers.get("content-type") || "",
    });

    const body = await readPayload(req);

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const source = String(body.source || "subscribe").trim();

    console.log("subscribe: payload parsed", {
      hasEmail: !!email,
      source,
    });

    if (!email) {
      return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const { success, duplicate } = await saveEmailSubscription(email, source);
    console.log("subscribe: db result", { success, duplicate });

    if (!success && !duplicate) {
      return NextResponse.json({ ok: false, error: "Insert failed" }, { status: 500 });
    }

    const res = NextResponse.json(
      { ok: true, duplicate: !!duplicate },
      { status: 200 }
    );

    // Option 1 architecture. store subscribed email server-side
    res.cookies.set("subscribed_email", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (e: any) {
    const err = e instanceof Error ? e : new Error(String(e));

    console.error("Subscribe API error full", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: e?.code,
      cause: e?.cause,
      causeMessage: e?.cause?.message,
    });

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        code: e?.code ?? null,
        causeMessage: e?.cause?.message ?? null,
      },
      { status: 500 }
    );
  }
}
