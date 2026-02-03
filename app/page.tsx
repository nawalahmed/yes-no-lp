"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailSubscribeModal from "./components/EmailSubscribeModal";

export default function HomePage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<"tool1" | "tool2">("tool1");
  return (
    <main className="page">
      <section className="hero">
        <h1 className="title">👋 Hi, I’m Nawal.</h1>
        <p className="subtitle">
          I build simple tools that make sharing and decisions feel effortless.
        </p>
      </section>

      <section className="cardWrap">
  {/* Tool 1 */}
  <div className="card toolRow">
    <div className="cardHeader">
      <span className="pill">Tool 1</span>
      <span className="muted">Yes or No link</span>
    </div>

    <div className="field">
      <div className="label">What it is</div>
      <div className="value">
        A simple question page. The recipient answers Yes or No.
      </div>
    </div>

    <div className="ctaRow">
      <button
        className="btnPrimary"
        onClick={() => {
          setModalSource("tool1");
          setModalOpen(true);
        }}
      >
        Create link
      </button>
      <span className="mutedSmall">Dodge Effect</span>
    </div>
  </div>

  {/* Tool 2 */}
  <div className="card toolRow">
    <div className="cardHeader">
      <span className="pill">Tool 2</span>
      <span className="muted">Automation Workflow</span>
    </div>

    <div className="field">
      <div className="label">What it is</div>
      <div className="value">
        Access my workflow for automating social media content.
      </div>
    </div>

    <div className="ctaRow">
      <button
        className="btnPrimary"
        onClick={() => {
          setModalSource("tool2");
          setModalOpen(true);
        }}
      >
        Subscribe to access
      </button>
      <span className="mutedSmall"></span>
    </div>
  </div>
</section>


      <footer className="footer">
        <a href="mailto:hello@nawalahmed.me" className="footerLink">Contact</a>
      </footer>

      <EmailSubscribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        source={modalSource}
        onSuccess={
          modalSource === "tool1"
            ? () => {
                setModalOpen(false);
                router.push("/create");
              }
            : () => {
              setModalOpen(false);
              router.push("https://imaginary-beak-821.notion.site/Turn-One-Message-Into-a-Posted-Instagram-Carousel-2eed8950d0698045b4d8e314165b5be2");
            }
        }
      />
    </main>
  );
}
