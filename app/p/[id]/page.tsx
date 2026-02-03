"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type DodgeButton = "yes" | "no";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function RecipientPage() {
  const router = useRouter();
  const params = useParams();

  // Next can return string | string[]. Be defensive.
  const id = useMemo(() => {
    const raw = (params as any)?.id as string | string[] | undefined;
    if (!raw) return "";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [recipientName, setRecipientName] = useState("");
  const [question, setQuestion] = useState<string | null>(null); // null = loading
  const [loading, setLoading] = useState(false);
  const [dodgeButton, setDodgeButton] = useState<DodgeButton>("no");

  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);

  const yesPlaceholderRef = useRef<HTMLButtonElement | null>(null);
  const yesFloatingRef = useRef<HTMLButtonElement | null>(null);

  const noPlaceholderRef = useRef<HTMLButtonElement | null>(null);
  const noFloatingRef = useRef<HTMLButtonElement | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, has: false });
  const posRef = useRef({ x: 0, y: 0 });

  const dodgePlaceholderRef = useMemo(() => {
    return dodgeButton === "yes" ? yesPlaceholderRef : noPlaceholderRef;
  }, [dodgeButton]);

  const dodgeFloatingRef = useMemo(() => {
    return dodgeButton === "yes" ? yesFloatingRef : noFloatingRef;
  }, [dodgeButton]);

  // Fetch page data
  useEffect(() => {
    if (!id) return;

    const ac = new AbortController();
    setQuestion(null);

    (async () => {
      try {
        const res = await fetch(`/api/page?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          // Don’t force blank space. Keep a readable fallback on mobile.
          setQuestion("Could not load the question.");
          setRecipientName("");
          setDodgeButton("no");
          return;
        }

        const data = (await res.json()) as {
          question?: string;
          name?: string;
          dodgeButton?: DodgeButton;
        };

        const q = String(data.question ?? "").trim();
        setQuestion(q.length ? q : " ");
        setRecipientName(String(data.name ?? "").trim());
        setDodgeButton(data.dodgeButton === "yes" ? "yes" : "no");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setQuestion("Could not load the question.");
        setRecipientName("");
        setDodgeButton("no");
      }
    })();

    return () => ac.abort();
  }, [id]);

  // Phase 1. mouse and touch support
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    const beginIfNeeded = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const ph = dodgePlaceholderRef.current;
      if (ph) {
        const r = ph.getBoundingClientRect();
        posRef.current = { x: r.left, y: r.top };
      } else {
        posRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      }

      setStarted(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, has: true };
      beginIfNeeded();
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches?.[0] || e.changedTouches?.[0];
      if (!t) return;
      mouseRef.current = { x: t.clientX, y: t.clientY, has: true };
      beginIfNeeded();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [dodgePlaceholderRef]);

  // Animation loop for dodging
  useEffect(() => {
    if (!started) return;
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    let raf = 0;

    const tick = () => {
      const b = dodgeFloatingRef.current;
      if (!b) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const bw = b.offsetWidth;
      const bh = b.offsetHeight;

      const bounds = {
        minX: 10,
        maxX: window.innerWidth - bw - 10,
        minY: 10,
        maxY: window.innerHeight - bh - 10,
      };

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const cx = posRef.current.x + bw / 2;
      const cy = posRef.current.y + bh / 2;

      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const repelRadius = 380;
      const maxStep = 28;

      if (mouseRef.current.has && dist < repelRadius) {
        const strength = (repelRadius - dist) / repelRadius;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        const step = maxStep * (0.4 + strength * 1.7);
        posRef.current.x += nx * step;
        posRef.current.y += ny * step;
      }

      posRef.current.x = clamp(posRef.current.x, bounds.minX, bounds.maxX);
      posRef.current.y = clamp(posRef.current.y, bounds.minY, bounds.maxY);

      b.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, dodgeFloatingRef]);

  async function submit(answer: "yes" | "no") {
    if (!id) return;

    try {
      setLoading(true);

      // More compatible than FormData in some mobile edge cases
      const body = new URLSearchParams();
      body.set("id", id);
      body.set("answer", answer);

      const res = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body.toString(),
        cache: "no-store",
      });

      if (!res.ok) {
        // Helps you debug real error cause, without breaking UX
        const msg = (await res.text().catch(() => "")) || "Could not submit. Try again.";
        setLoading(false);
        alert(msg);
        return;
      }

      router.push(`/r/${id}`);
    } catch {
      setLoading(false);
      alert("Could not submit. Try again.");
    }
  }

  const titleText = useMemo(() => {
    const q = question === null ? "Loading..." : (question || " ");
    const prefix = recipientName ? `${recipientName}, ` : "";
    return `${prefix}${q}`;
  }, [recipientName, question]);

  const yesIsDodging = dodgeButton === "yes";
  const noIsDodging = dodgeButton === "no";

  return (
    <main className="page">
      <section className="hero heroCenter">
        <div className="topMedia" aria-hidden="true">
          <img
            src="/images/hero-invite.png"
            alt=""
            className="heroImage"
            loading="eager"
          />
        </div>

        <h1 className="questionTitle">{titleText}</h1>

        <div className="buttonRow">
          <button
            ref={yesPlaceholderRef}
            className={`btnChoice btnChoiceWide ${
              started && yesIsDodging ? "noPlaceholderHidden" : ""
            }`}
            type="button"
            onClick={() => submit("yes")}
            disabled={loading || !id || (started && yesIsDodging)}
            aria-disabled={loading || !id || (started && yesIsDodging)}
            title={started && yesIsDodging ? "Nice try 😄" : ""}
          >
            {loading ? "Sending..." : "Yes"}
          </button>

          <button
            ref={noPlaceholderRef}
            className={`btnChoice btnChoiceWide ${
              started && noIsDodging ? "noPlaceholderHidden" : ""
            }`}
            type="button"
            onClick={() => submit("no")}
            disabled={loading || !id || (started && noIsDodging)}
            aria-disabled={loading || !id || (started && noIsDodging)}
            title={started && noIsDodging ? "Nice try 😄" : ""}
          >
            No
          </button>
        </div>

        <p className="tinyFooter">
          {dodgeButton === "no"
            ? "P.S. The No button is on a personal growth journey. It’s not ready yet."
            : "P.S. The Yes button is shy today. You’ll have to work for it."}
        </p>

        {started && yesIsDodging ? (
          <button
            ref={yesFloatingRef}
            className="btnChoice btnNoFloating"
            type="button"
            disabled
            aria-disabled="true"
            title="Nice try 😄"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: "translate(0px, 0px)",
              touchAction: "none",
            }}
          >
            Yes
          </button>
        ) : null}

        {started && noIsDodging ? (
          <button
            ref={noFloatingRef}
            className="btnChoice btnNoFloating"
            type="button"
            disabled
            aria-disabled="true"
            title="Nice try 😄"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: "translate(0px, 0px)",
              touchAction: "none",
            }}
          >
            No
          </button>
        ) : null}
      </section>
    </main>
  );
}
