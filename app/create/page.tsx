"use client";

import { useState } from "react";

type DodgeButton = "yes" | "no";

export default function CreatePage() {
  const [recipientName, setRecipientName] = useState("");
  const [question, setQuestion] = useState("Will you be my valentine?");
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dodgeButton, setDodgeButton] = useState<DodgeButton>("no");

  async function onCreate() {
    if (isLoading) return;

    setError(null);
    setCreatedLink(null);

    const r = recipientName.trim().slice(0, 80);
    const q = question.trim().slice(0, 200);

    if (!r || !q) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          recipientName: r,
          question: q,
          dodgeButton,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();

        if (res.status === 401 || res.status === 403) {
          throw new Error("Please subscribe first, then try again.");
        }

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
        <p className="subtitle">Personalize it. Share it.</p>

        <div className="cardWrap">
          <div className="card minimal">
            <div className="stack">
              <div className="field">
                <label className="label light">Recipient name</label>
                <input
                  type="text"
                  className="inputGhost"
                  placeholder="Enter their name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  autoComplete="off"
                  maxLength={80}
                />
              </div>

              <div className="field">
                <label className="label light">Question</label>
                <textarea
                  rows={2}
                  className="inputGhost textareaGhost"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="field">
                <label className="label light">Recipient will struggle to click?</label>

                <label className="radioRow">
                  <input
                    type="radio"
                    name="dodge"
                    checked={dodgeButton === "no"}
                    onChange={() => setDodgeButton("no")}
                  />
                  <span className="radioText">No</span>
                </label>

                <label className="radioRow">
                  <input
                    type="radio"
                    name="dodge"
                    checked={dodgeButton === "yes"}
                    onChange={() => setDodgeButton("yes")}
                  />
                  <span className="radioText">Yes</span>
                </label>
              </div>
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

                <a
                  className="successLinkAnchor"
                  href={createdLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {createdLink}
                </a>

                <div className="successRow">
                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => navigator.clipboard.writeText(createdLink)}
                  >
                    Copy link
                  </button>

                  <a
                    className="btnPrimary"
                    href={createdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open link
                  </a>
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
