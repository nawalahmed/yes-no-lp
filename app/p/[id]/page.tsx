"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function RecipientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);

  const noPlaceholderRef = useRef<HTMLButtonElement | null>(null);
  const noFloatingRef = useRef<HTMLButtonElement | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, has: false });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/page?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!res.ok) return setQuestion(" ");
        const data = (await res.json()) as { question: string };
        setQuestion(data.question || " ");
      } catch {
        setQuestion(" ");
      }
    })();
  }, [id]);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, has: true };

      if (!startedRef.current) {
        startedRef.current = true;

        const ph = noPlaceholderRef.current;
        if (ph) {
          const r = ph.getBoundingClientRect();
          posRef.current = { x: r.left, y: r.top };
        } else {
          posRef.current = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          };
        }

        setStarted(true);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!started) return;

    const btn = noFloatingRef.current;
    if (!btn) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    let raf = 0;

    const tick = () => {
      const b = noFloatingRef.current;
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

      const repelRadius = 560;
      const maxStep = 26;

      if (mouseRef.current.has && dist < repelRadius) {
        const strength = (repelRadius - dist) / repelRadius;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        const step = maxStep * (0.35 + strength * 1.6);
        posRef.current.x += nx * step;
        posRef.current.y += ny * step;
      }

      posRef.current.x = clamp(
        posRef.current.x,
        bounds.minX,
        bounds.maxX
      );
      posRef.current.y = clamp(
        posRef.current.y,
        bounds.minY,
        bounds.maxY
      );

      b.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  async function submitYes() {
    if (!id) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.set("id", id);
      form.set("answer", "yes");

      const res = await fetch("/api/answer", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        setLoading(false);
        alert("Could not submit. Try again.");
        return;
      }

      router.push(`/r/${id}`);
    } catch {
      setLoading(false);
      alert("Could not submit. Try again.");
    }
  }

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

        <h1 className="questionTitle">{question || " "}</h1>

        <div className="buttonRow">
          <button
            className="btnChoice btnChoiceWide"
            type="button"
            onClick={submitYes}
            disabled={loading || !id}
          >
            {loading ? "Sending..." : "Yes"}
          </button>

          <button
            ref={noPlaceholderRef}
            className={`btnChoice btnChoiceWide ${
              started ? "noPlaceholderHidden" : ""
            }`}
            type="button"
            disabled
            aria-disabled="true"
            title="Nice try 😄"
          >
            No
          </button>
        </div>

        <p className="tinyFooter">
          P.S. The No button is on a personal growth journey. It’s not ready yet.
        </p>

        {started ? (
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
            }}
          >
            No
          </button>
        ) : null}
      </section>
    </main>
  );
}
