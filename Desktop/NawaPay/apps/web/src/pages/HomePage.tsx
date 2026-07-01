import { Activity, BadgeCheck, Banknote, Building2, Gamepad2, Lightbulb, LockKeyhole, Router, ShieldCheck, Smartphone } from "lucide-react";
import { OperatorTerminal } from "../components/OperatorTerminal";

const transactions = [
  { id: "TX-90841", merchant: "Electricity Token", account: "Meter 043991", amount: "N$ 350.00", risk: 14, status: "Settled" },
  { id: "TX-90842", merchant: "MTC Airtime", account: "0815550101", amount: "N$ 50.00", risk: 16, status: "Settled" },
  { id: "TX-90843", merchant: "Castle Bet", account: "CB-29481", amount: "N$ 300.00", risk: 58, status: "Screening" }
];

const controls = [
  { label: "Providers Live", value: "14", icon: Router },
  { label: "KYC Verified", value: "94.8%", icon: BadgeCheck },
  { label: "AML Alerts", value: "17", icon: ShieldCheck },
  { label: "Merchants", value: "428", icon: Building2 }
];

const providers = [
  { name: "Electricity", description: "Buy prepaid power tokens", icon: Lightbulb, status: "Online" },
  { name: "MTC / TN Airtime", description: "Mobile credit and data bundles", icon: Smartphone, status: "Online" },
  { name: "Castle Bet / JSB", description: "Regulated wallet top-ups", icon: Gamepad2, status: "Screened" }
];

export function HomePage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Middleman payment switch</p>
         
        </div>
        <button type="button"><LockKeyhole size={18} /> ISO 27001 Controls</button>
      </header>

      <section className="hero-grid" id="overview">
        <div className="balance-panel">
          <div>
            <p>Available liquidity</p>
            <strong>N$ 90.40</strong>
            <span className="subcopy">Float available for settling providers and merchants.</span>
          </div>
          <div className="card-visual" aria-hidden="true">
            <span>NAWAPAY</span>
            <b>PAYMENT SWITCH</b>
          </div>
        </div>
        <div className="transfer-panel" id="payments">
          <h2>Customer bill payment</h2>
          <div className="form-grid">
            <label>Customer wallet<input value="wal_consumer_001" readOnly /></label>
            <label>Provider<input value="MTC Airtime" readOnly /></label>
            <label>Reference<input value="0815550101" readOnly /></label>
            <label>Amount<input value="50.00 NAD" readOnly /></label>
          </div>
          <button type="button"><Banknote size={18} /> Route payment</button>
        </div>
      </section>

      <section className="provider-grid">
        {providers.map((provider) => {
          const Icon = provider.icon;
          return (
            <article key={provider.name}>
              <Icon size={22} />
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.description}</span>
              </div>
              <b>{provider.status}</b>
            </article>
          );
        })}
      </section>

      <OperatorTerminal />

      <section className="metrics" id="compliance">
        {controls.map((control) => {
          const Icon = control.icon;
          return (
            <article key={control.label}>
              <Icon size={22} />
              <span>{control.label}</span>
              <strong>{control.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="content-grid">
        <div className="table-panel">
          <div className="section-title">
            <h2>Live transaction screening</h2>
            <span>REST API backed</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Provider</th>
                <th>Customer ref</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.merchant}</td>
                  <td>{transaction.account}</td>
                  <td>{transaction.amount}</td>
                  <td>
                    <meter min="0" max="100" value={transaction.risk} />
                    {transaction.risk}
                  </td>
                  <td><span className={`status ${transaction.status.toLowerCase()}`}>{transaction.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rules-panel">
          <h2>Regtech rule engine</h2>
          <div className="rule active"><ShieldCheck size={18} /> Block high-risk references</div>
          <div className="rule"><BadgeCheck size={18} /> Require verified KYC before settlement</div>
          <div className="rule"><Gamepad2 size={18} /> Extra screening for gambling top-ups</div>
          <div className="rule"><Activity size={18} /> Audit every privileged action</div>
        </div>
      </section>
    </>
  );
}
