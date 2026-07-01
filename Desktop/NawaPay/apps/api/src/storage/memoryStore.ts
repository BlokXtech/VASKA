import crypto from "node:crypto";
import { AuditEvent, Merchant, PaymentRequest, ServiceProvider, Transaction, Wallet } from "../domain/types.js";
import { calculateAmlRisk } from "../domain/compliance.js";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

const wallets: Wallet[] = [
  {
    id: "wal_consumer_001",
    ownerId: "cus_kaume",
    currency: "NAD",
    balanceMinor: 286_450,
    kycStatus: "verified",
    createdAt: now()
  },
  {
    id: "wal_merchant_001",
    ownerId: "mrc_windhoek_market",
    currency: "NAD",
    balanceMinor: 1_940_900,
    kycStatus: "verified",
    createdAt: now()
  },
  {
    id: "wal_provider_electricity",
    ownerId: "prv_city_power",
    currency: "NAD",
    balanceMinor: 3_800_000,
    kycStatus: "verified",
    createdAt: now()
  },
  {
    id: "wal_provider_mtc",
    ownerId: "prv_mtc",
    currency: "NAD",
    balanceMinor: 2_100_000,
    kycStatus: "verified",
    createdAt: now()
  },
  {
    id: "wal_provider_telecom",
    ownerId: "prv_telecom",
    currency: "NAD",
    balanceMinor: 1_430_000,
    kycStatus: "verified",
    createdAt: now()
  },
  {
    id: "wal_provider_castlebet",
    ownerId: "prv_castlebet",
    currency: "NAD",
    balanceMinor: 980_000,
    kycStatus: "verified",
    createdAt: now()
  }
];

const merchants: Merchant[] = [
  {
    id: "mrc_windhoek_market",
    name: "Windhoek Market",
    category: "Retail and agency banking",
    settlementWalletId: "wal_merchant_001",
    complianceTier: "enhanced"
  }
];

const serviceProviders: ServiceProvider[] = [
  {
    id: "prv_city_power",
    name: "Electricity Token",
    category: "electricity",
    settlementWalletId: "wal_provider_electricity",
    status: "online",
    commissionBps: 180,
    complianceTier: "standard",
    customerReferenceLabel: "Meter number"
  },
  {
    id: "prv_mtc",
    name: "MTC Airtime",
    category: "airtime",
    settlementWalletId: "wal_provider_mtc",
    status: "online",
    commissionBps: 220,
    complianceTier: "standard",
    customerReferenceLabel: "MTC mobile number"
  },
  {
    id: "prv_telecom",
    name: "TN Mobile / Telecom",
    category: "airtime",
    settlementWalletId: "wal_provider_telecom",
    status: "online",
    commissionBps: 200,
    complianceTier: "standard",
    customerReferenceLabel: "TN mobile number"
  },
  {
    id: "prv_castlebet",
    name: "Castle Bet Wallet",
    category: "betting",
    settlementWalletId: "wal_provider_castlebet",
    status: "degraded",
    commissionBps: 140,
    complianceTier: "enhanced",
    customerReferenceLabel: "Betting account ID"
  },
  {
    id: "prv_jsb",
    name: "JSB Betting Wallet",
    category: "betting",
    settlementWalletId: "wal_provider_castlebet",
    status: "online",
    commissionBps: 135,
    complianceTier: "enhanced",
    customerReferenceLabel: "Betting account ID"
  }
];

const transactions: Transaction[] = [
  {
    id: "txn_seed_001",
    payerWalletId: "wal_consumer_001",
    payeeWalletId: "wal_merchant_001",
    amountMinor: 125_00,
    currency: "NAD",
    status: "settled",
    riskScore: 12,
    amlFlags: [],
    reference: "Merchant QR purchase",
    createdAt: now()
  },
  {
    id: "txn_seed_002",
    payerWalletId: "wal_consumer_001",
    payeeWalletId: "wal_provider_mtc",
    amountMinor: 50_00,
    currency: "NAD",
    status: "settled",
    providerId: "prv_mtc",
    customerAccount: "0815550101",
    riskScore: 16,
    amlFlags: [],
    reference: "MTC airtime top-up",
    createdAt: now()
  },
  {
    id: "txn_seed_003",
    payerWalletId: "wal_consumer_001",
    payeeWalletId: "wal_provider_castlebet",
    amountMinor: 300_00,
    currency: "NAD",
    status: "screening",
    providerId: "prv_castlebet",
    customerAccount: "CB-29481",
    riskScore: 58,
    amlFlags: ["gambling_exposure"],
    reference: "Castle Bet wallet top-up",
    createdAt: now()
  }
];

const auditEvents: AuditEvent[] = [];

export const memoryStore = {
  listWallets: () => wallets,
  listMerchants: () => merchants,
  listServiceProviders: () => serviceProviders,
  getServiceProvider: (providerId: string) => serviceProviders.find((serviceProvider) => serviceProvider.id === providerId),
  listTransactions: () => transactions,
  listAuditEvents: () => auditEvents,

  recordAudit(event: Omit<AuditEvent, "id" | "createdAt">) {
    const audit = { id: id("aud"), createdAt: now(), ...event };
    auditEvents.unshift(audit);
    return audit;
  },

  createPayment(payment: PaymentRequest) {
    const provider = payment.providerId
      ? serviceProviders.find((serviceProvider) => serviceProvider.id === payment.providerId)
      : undefined;
    const routedPayment = provider
      ? { ...payment, payeeWalletId: provider.settlementWalletId }
      : payment;
    const payer = wallets.find((wallet) => wallet.id === payment.payerWalletId);
    const payee = wallets.find((wallet) => wallet.id === routedPayment.payeeWalletId);
    const risk = calculateAmlRisk(routedPayment, payer, payee);
    const transaction: Transaction = {
      id: id("txn"),
      payerWalletId: routedPayment.payerWalletId,
      payeeWalletId: routedPayment.payeeWalletId,
      amountMinor: routedPayment.amountMinor,
      currency: routedPayment.currency,
      status: risk.approved ? "approved" : "blocked",
      providerId: routedPayment.providerId,
      customerAccount: routedPayment.customerAccount,
      riskScore: risk.riskScore,
      amlFlags: risk.amlFlags,
      reference: routedPayment.reference,
      createdAt: now()
    };

    if (risk.approved && payer && payee && payer.balanceMinor >= routedPayment.amountMinor) {
      payer.balanceMinor -= routedPayment.amountMinor;
      payee.balanceMinor += routedPayment.amountMinor;
      transaction.status = "settled";
    }

    transactions.unshift(transaction);
    return transaction;
  },

  createProviderPayment(input: Omit<PaymentRequest, "payeeWalletId">) {
    const provider = serviceProviders.find((serviceProvider) => serviceProvider.id === input.providerId);
    if (!provider) {
      throw new Error("provider_not_found");
    }

    return this.createPayment({
      ...input,
      payeeWalletId: provider.settlementWalletId
    });
  }
};
