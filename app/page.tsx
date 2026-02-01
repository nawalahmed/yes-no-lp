export default function HomePage() {
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
      <a className="btnPrimary" href="/create">Create link</a>
      <span className="mutedSmall"></span>
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
    <a
      className="btnPrimary"
      href="https://nwl.kit.com/ddba6053ef"
      target="_blank"
      rel="noopener noreferrer"
    >Subscribe to access
  </a>  
    <span className="mutedSmall"></span>
    </div>
  </div>
</section>


      <footer className="footer">
        <a href="/privacy" className="footerLink">Privacy</a>
        <a href="/terms" className="footerLink">Terms</a>
        <a href="mailto:hello@nawalahmed.me" className="footerLink">Contact</a>
      </footer>
    </main>
  );
}
