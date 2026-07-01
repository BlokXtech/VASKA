import { FormEvent, useMemo, useState } from "react";
import { Gamepad2, Lightbulb, ReceiptText } from "lucide-react";

type SaleMode = "electricity" | "betting";

interface SaleResult {
  transaction: {
    id: string;
    status: string;
    riskScore: number;
  };
  fulfilment: null | {
    providerName: string;
    fulfilmentType: string;
    token: string;
    providerReference: string;
    message: string;
  };
  changeMinor: number;
}

const providers = {
  electricity: {
    channel: "bill_payment",
    label: "Electricity token",
    accountLabel: "Electricity meter number",
    placeholder: "04399100291",
    icon: Lightbulb,
    options: [
      { id: "prv_city_power", name: "Electricity Token" }
    ]
  },
  betting: {
    channel: "betting_topup",
    label: "Betting wallet PIN",
    accountLabel: "Betting account number",
    placeholder: "CB-29481",
    icon: Gamepad2,
    options: [
      { id: "prv_castlebet", name: "Castle Bet" },
      { id: "prv_jsb", name: "JSB" }
    ]
  }
} as const;

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4100";

export function OperatorTerminal() {
  const [mode, setMode] = useState<SaleMode>("electricity");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("100");
  const [cashReceived, setCashReceived] = useState("100");
  const [operatorId, setOperatorId] = useState("operator-001");
  const [providerId, setProviderId] = useState<string>(providers.electricity.options[0].id);
  const [result, setResult] = useState<SaleResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = providers[mode];
  const Icon = selected.icon;
  const amountMinor = useMemo(() => Math.round(Number(amount || 0) * 100), [amount]);
  const cashReceivedMinor = useMemo(() => Math.round(Number(cashReceived || 0) * 100), [cashReceived]);

  function changeMode(nextMode: SaleMode) {
    setMode(nextMode);
    setProviderId(providers[nextMode].options[0].id);
    setResult(null);
    setError("");
  }

  async function submitSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const tokenResponse = await fetch(`${apiUrl}/api/auth/service-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: operatorId })
      });
      const tokenBody = await tokenResponse.json();

      const saleResponse = await fetch(`${apiUrl}/api/operator/provider-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenBody.token}`
        },
        body: JSON.stringify({
          providerId,
          customerAccount: account,
          amountMinor,
          cashReceivedMinor,
          operatorId,
          channel: selected.channel,
          reference: `${selected.label} for ${account}`
        })
      });

      const saleBody = await saleResponse.json();
      if (!saleResponse.ok) {
        throw new Error(saleBody.error ?? "Provider sale failed");
      }

      setResult(saleBody);
    } catch (saleError) {
      setError(saleError instanceof Error ? saleError.message : "Provider sale failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="operator-terminal">
      <div className="terminal-heading">
        <div>
          <p className="eyebrow">Operator cash desk</p>
          <h2>Receive cash, connect to provider, generate token or PIN</h2>
        </div>
        <ReceiptText size={26} />
      </div>

      <div className="mode-switch">
        <button className={mode === "electricity" ? "selected" : undefined} type="button" onClick={() => changeMode("electricity")}>
          <Lightbulb size={18} /> Electricity
        </button>
        <button className={mode === "betting" ? "selected" : undefined} type="button" onClick={() => changeMode("betting")}>
          <Gamepad2 size={18} /> Betting
        </button>
      </div>

      <form className="operator-form" onSubmit={submitSale}>
        <label>
          Operator ID
          <input value={operatorId} onChange={(event) => setOperatorId(event.target.value)} required />
        </label>
        <label>
          Service provider
          <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
            {selected.options.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </label>
        <label>
          {selected.accountLabel}
          <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder={selected.placeholder} required />
        </label>
        <label>
          Amount
          <input min="1" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </label>
        <label>
          Cash received
          <input min="1" step="0.01" type="number" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} required />
        </label>
        <button disabled={loading} type="submit">
          <Icon size={18} /> {loading ? "Connecting..." : `Generate ${mode === "electricity" ? "token" : "PIN"}`}
        </button>
      </form>

      {error && <div className="terminal-error">{error}</div>}

      {result?.fulfilment && (
        <div className="voucher-output">
          <div>
            <span>{result.fulfilment.providerName}</span>
            <strong>{result.fulfilment.token}</strong>
          </div>
          <p>{result.fulfilment.message}</p>
          <div className="voucher-grid">
            <span>Provider ref: {result.fulfilment.providerReference}</span>
            <span>Transaction: {result.transaction.id}</span>
            <span>Risk score: {result.transaction.riskScore}</span>
            <span>Change: N$ {(result.changeMinor / 100).toFixed(2)}</span>
          </div>
        </div>
      )}

      {result?.fulfilment === null && (
        <div className="terminal-warning">Compliance review required before provider fulfilment.</div>
      )}
    </section>
  );
}
