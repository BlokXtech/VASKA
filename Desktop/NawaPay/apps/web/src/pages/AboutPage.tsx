export function AboutPage() {
  return (
    <section className="about-section page-section">
      <div className="about-copy">
        <p className="eyebrow">About Haikonda Technologies</p>
        <h1>Company History</h1>
        <p>
          Haikonda Technologies was founded to build practical digital payment tools for everyday Namibian commerce. The company began with a simple goal: make it easier for customers to pay for essential services like electricity, airtime, merchant purchases, and regulated wallet top-ups through one trusted middleman platform.
        </p>
        <p>
          NAWAPAY is the company&apos;s payment-switch product. It connects customers, service providers, agents, and merchants through secure routing, transaction screening, settlement records, and compliance controls.
        </p>

        <div className="founder-grid">
          <article>
            <strong>Founder</strong>
            <span>Write founder name, background, and vision here.</span>
          </article>
          <article>
            <strong>CEO</strong>
            <span>Write CEO name, leadership story, and company mission here.</span>
          </article>
          <article>
            <strong>Team</strong>
            <span>Write engineering, compliance, operations, and support team details here.</span>
          </article>
        </div>
      </div>
      <div className="about-photo" role="img" aria-label="Haikonda Technologies company photo placeholder">
        <div>
          <span>HAIKONDA TECHNOLOGIES</span>
          <strong>Team photo / office picture</strong>
        </div>
      </div>
    </section>
  );
}
