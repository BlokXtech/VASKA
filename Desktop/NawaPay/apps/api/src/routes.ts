import { Router } from "express";
import { z } from "zod";
import { issueServiceToken, authenticate, AuthenticatedRequest } from "./middleware/auth.js";
import { fulfilProviderPayment } from "./providers/providerClient.js";
import { memoryStore } from "./storage/memoryStore.js";

const router = Router();

const paymentSchema = z.object({
  payerWalletId: z.string().min(3),
  payeeWalletId: z.string().min(3),
  amountMinor: z.number().int().positive(),
  currency: z.enum(["NAD", "ZAR", "USD", "EUR"]),
  channel: z.enum(["wallet", "card", "merchant_qr", "agent_cash_in", "bill_payment", "airtime_topup", "betting_topup"]),
  reference: z.string().min(3).max(140),
  providerId: z.string().optional(),
  customerAccount: z.string().optional(),
  metadata: z.record(z.string()).optional()
});

const providerPaymentSchema = paymentSchema.omit({ payeeWalletId: true }).extend({
  providerId: z.string().min(3),
  customerAccount: z.string().min(3)
});

const operatorProviderSaleSchema = z.object({
  providerId: z.string().min(3),
  customerAccount: z.string().min(3).max(80),
  amountMinor: z.number().int().positive(),
  cashReceivedMinor: z.number().int().positive(),
  operatorId: z.string().min(3),
  channel: z.enum(["bill_payment", "airtime_topup", "betting_topup"]),
  reference: z.string().min(3).max(140)
});

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "nawapay-api",
    controls: ["kyc", "aml", "gdpr", "iso27001"]
  });
});

router.post("/auth/service-token", (req, res) => {
  const actorId = typeof req.body?.actorId === "string" ? req.body.actorId : "ops-console";
  res.json({ token: issueServiceToken(actorId) });
});

router.get("/wallets", authenticate, (req: AuthenticatedRequest, res) => {
  memoryStore.recordAudit({
    actorId: req.actorId ?? "unknown",
    action: "wallets.read",
    resource: "wallet",
    ipAddress: req.ip ?? "unknown"
  });
  res.json({ wallets: memoryStore.listWallets() });
});

router.get("/merchants", authenticate, (_req, res) => {
  res.json({ merchants: memoryStore.listMerchants() });
});

router.get("/providers", authenticate, (_req, res) => {
  res.json({ providers: memoryStore.listServiceProviders() });
});

router.get("/transactions", authenticate, (_req, res) => {
  res.json({ transactions: memoryStore.listTransactions() });
});

router.post("/payments", authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payment_request", issues: parsed.error.flatten() });
    return;
  }

  const transaction = memoryStore.createPayment(parsed.data);
  memoryStore.recordAudit({
    actorId: req.actorId ?? "unknown",
    action: "payments.create",
    resource: transaction.id,
    ipAddress: req.ip ?? "unknown"
  });

  res.status(transaction.status === "blocked" ? 202 : 201).json({ transaction });
});

router.post("/provider-payments", authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = providerPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_provider_payment_request", issues: parsed.error.flatten() });
    return;
  }

  try {
    const transaction = memoryStore.createProviderPayment(parsed.data);
    memoryStore.recordAudit({
      actorId: req.actorId ?? "unknown",
      action: "provider_payments.create",
      resource: transaction.id,
      ipAddress: req.ip ?? "unknown"
    });
    res.status(transaction.status === "blocked" ? 202 : 201).json({ transaction });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : "provider_not_found" });
  }
});

router.post("/operator/provider-sales", authenticate, async (req: AuthenticatedRequest, res) => {
  const parsed = operatorProviderSaleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_operator_provider_sale", issues: parsed.error.flatten() });
    return;
  }

  const provider = memoryStore.getServiceProvider(parsed.data.providerId);
  if (!provider) {
    res.status(404).json({ error: "provider_not_found" });
    return;
  }

  if (parsed.data.cashReceivedMinor < parsed.data.amountMinor) {
    res.status(400).json({ error: "insufficient_cash_received" });
    return;
  }

  const transaction = memoryStore.createProviderPayment({
    payerWalletId: "wal_consumer_001",
    providerId: provider.id,
    customerAccount: parsed.data.customerAccount,
    amountMinor: parsed.data.amountMinor,
    currency: "NAD",
    channel: parsed.data.channel,
    reference: parsed.data.reference,
    metadata: {
      operatorId: parsed.data.operatorId,
      cashReceivedMinor: String(parsed.data.cashReceivedMinor)
    }
  });

  if (transaction.status === "blocked") {
    res.status(202).json({ transaction, fulfilment: null, message: "Payment requires compliance review before provider fulfilment." });
    return;
  }

  const fulfilment = await fulfilProviderPayment({
    provider,
    amountMinor: parsed.data.amountMinor,
    customerAccount: parsed.data.customerAccount,
    operatorId: parsed.data.operatorId
  });

  memoryStore.recordAudit({
    actorId: req.actorId ?? parsed.data.operatorId,
    action: "operator_provider_sales.fulfil",
    resource: transaction.id,
    ipAddress: req.ip ?? "unknown"
  });

  res.status(201).json({
    transaction,
    fulfilment,
    changeMinor: parsed.data.cashReceivedMinor - parsed.data.amountMinor
  });
});

router.get("/compliance/audit-events", authenticate, (_req, res) => {
  res.json({ auditEvents: memoryStore.listAuditEvents() });
});

router.get("/compliance/report", authenticate, (_req, res) => {
  const transactions = memoryStore.listTransactions();
  const blocked = transactions.filter((transaction) => transaction.status === "blocked").length;
  const highRisk = transactions.filter((transaction) => transaction.riskScore >= 70).length;
  res.json({
    generatedAt: new Date().toISOString(),
    standards: {
      kyc: "identity checks enforced before settlement",
      aml: "transaction scoring and suspicious activity flags",
      gdpr: "data minimization and audit access tracking",
      iso27001: "security controls mapped to access, logging, and change management"
    },
    metrics: {
      totalTransactions: transactions.length,
      blockedTransactions: blocked,
      highRiskTransactions: highRisk
    }
  });
});

export default router;
