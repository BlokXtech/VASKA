import { PaymentRequest, Wallet } from "./types.js";

const highRiskReferences = ["crypto mixer", "sanction", "structuring", "cash split"];

export function calculateAmlRisk(payment: PaymentRequest, payer?: Wallet, payee?: Wallet) {
  const flags: string[] = [];
  let score = 8;

  if (!payer || !payee) {
    flags.push("wallet_not_found");
    score += 35;
  }

  if (payer?.kycStatus !== "verified") {
    flags.push("payer_kyc_incomplete");
    score += 30;
  }

  if (payee?.kycStatus !== "verified") {
    flags.push("payee_kyc_incomplete");
    score += 20;
  }

  if (payment.amountMinor >= 100_000) {
    flags.push("large_value_payment");
    score += 20;
  }

  if (payment.channel === "agent_cash_in") {
    flags.push("cash_exposure");
    score += 12;
  }

  if (payment.channel === "betting_topup") {
    flags.push("gambling_exposure");
    score += 18;
  }

  if (!payment.customerAccount && ["bill_payment", "airtime_topup", "betting_topup"].includes(payment.channel)) {
    flags.push("missing_customer_reference");
    score += 25;
  }

  const reference = payment.reference.toLowerCase();
  if (highRiskReferences.some((phrase) => reference.includes(phrase))) {
    flags.push("high_risk_reference");
    score += 40;
  }

  return {
    riskScore: Math.min(score, 100),
    amlFlags: flags,
    approved: score < 70 && flags.length < 4
  };
}

export function gdprSafeProfile<T extends { id: string; email?: string; phone?: string }>(profile: T) {
  return {
    id: profile.id,
    email: profile.email ? maskEmail(profile.email) : undefined,
    phone: profile.phone ? `${profile.phone.slice(0, 4)}****${profile.phone.slice(-2)}` : undefined
  };
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}
