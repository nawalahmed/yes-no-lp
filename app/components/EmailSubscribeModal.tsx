"use client";

import { useState, useEffect, FormEvent } from "react";

interface EmailSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: "tool1" | "tool2";
  onSuccess?: () => void;
}

export default function EmailSubscribeModal({
  isOpen,
  onClose,
  source,
  onSuccess,
}: EmailSubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail("");
        setError("");
        setSuccess(false);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      console.log("TURSO ENV", {
  url: !!(globalThis as any)?.process?.env?.TURSO_DB_URL,
  urlMeta: !!(import.meta as any)?.env?.TURSO_DB_URL,
});
      if (response.ok || response.status === 409) {
        // Treat both success and duplicate as success
        setSuccess(true);
        if (onSuccess) {
          // Call onSuccess immediately for custom flow (like redirect)
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          // Default behavior: just close modal after 2 seconds
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        const text = await response.text();
        console.error("Subscribe API error:", response.status, text);
        setError(text || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error("Subscribe fetch error:", err);
      setError(`Network error: ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={handleOverlayClick}>
      <div className="modalCard">
        <div className="modalHeader">
          <h2 className="modalTitle">
            {source === "tool1" ? "Get Started" : "Subscribe for Access"}
          </h2>
          <button
            type="button"
            className="modalClose"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="modalDescription">
          {source === "tool1"
            ? "Enter your email to create your first yes/no link and start getting direct answers."
            : "Enter your email to get early access to this feature when it launches."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="inputEmail"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            autoFocus
          />

          {error && <div className="hintText">{error}</div>}

          <button
            type="submit"
            className="btnPrimary full"
            disabled={loading || success}
          >
            {loading ? "Subscribing..." : success ? "Subscribed!" : "Subscribe"}
          </button>

          {success && (
            <div className="successText">
              Thanks! Check your email for next steps.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
