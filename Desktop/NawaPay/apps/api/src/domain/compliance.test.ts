import { describe, expect, it } from "vitest";
import { calculateAmlRisk } from "./compliance.js";

describe("calculateAmlRisk", () => {
  it("approves a low-risk verified-wallet payment", () => {
    const risk = calculateAmlRisk(
      {
        payerWalletId: "payer",
        payeeWalletId: "payee",
        amountMinor: 5000,
        currency: "NAD",
        channel: "wallet",
        reference: "School fees"
      },
      { id: "payer", ownerId: "a", currency: "NAD", balanceMinor: 10000, kycStatus: "verified", createdAt: "" },
      { id: "payee", ownerId: "b", currency: "NAD", balanceMinor: 0, kycStatus: "verified", createdAt: "" }
    );

    expect(risk.approved).toBe(true);
    expect(risk.amlFlags).toEqual([]);
  });

  it("blocks obvious high-risk payment patterns", () => {
    const risk = calculateAmlRisk({
      payerWalletId: "missing",
      payeeWalletId: "missing",
      amountMinor: 200000,
      currency: "NAD",
      channel: "agent_cash_in",
      reference: "crypto mixer cash split"
    });

    expect(risk.approved).toBe(false);
    expect(risk.riskScore).toBe(100);
  });
});
