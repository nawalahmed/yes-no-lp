"use client";

import { useState } from "react";

const STATIC_QUESTION = "Will you be my valentine?";

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    console.log("Create clicked");
    setError(null);
    setCreatedLink(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: STATIC_QUESTION }),
        cache: "no-store",
    });


      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create link.");
      }

      const data = (await res.json()) as { id: string };
      const link = `${window.location.origin}/p/${data.id}`;
      setCreatedLink(link);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <h1 className="title">Create a link</h1>
        <p className="subtitle">This question is static. You generate a shareable link.</p>

        <div className="cardWrap">
          <div className="card">
            <div className="cardHeader">
              <span className="pill">Preview</span>
              <span className="muted">Static</span>
            </div>

            <div className="field">
              <div className="label">Question</div>
              <div className="value">{STATIC_QUESTION}</div>
            </div>

            <div className="btnGrid">
              <button className="btnChoice" type="button">Yes</button>
              <button className="btnChoice" type="button">No</button>
            </div>

            <button
              className="btnPrimary full"
              type="button"
              onClick={onCreate}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create link"}
            </button>

            {error ? <div className="errorText">{error}</div> : null}

            {createdLink ? (
              <div className="successBox">
                <div className="successTitle">Your link is ready</div>
                <div className="successLink">{createdLink}</div>
                <div className="successRow">
                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => navigator.clipboard.writeText(createdLink)}
                  >
                    Copy link
                  </button>
                </div>
              </div>
            ) : null}

            <div className="finePrint">
              <a className="footerLink" href="/">Back to home</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
