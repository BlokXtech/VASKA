export type Currency = "NAD" | "ZAR" | "USD" | "EUR";

export type KycStatus = "not_started" | "pending" | "verified" | "rejected";

export type TransactionStatus = "queued" | "screening" | "approved" | "blocked" | "settled";

export type ProviderCategory = "electricity" | "airtime" | "data" | "betting" | "merchant";

export type ProviderStatus = "online" | "degraded" | "offline";

export interface Wallet {
  id: string;
  ownerId: string;
  currency: Currency;
  balanceMinor: number;
  kycStatus: KycStatus;
  createdAt: string;
}

export interface PaymentRequest {
  payerWalletId: string;
  payeeWalletId: string;
  amountMinor: number;
  currency: Currency;
  channel: "wallet" | "card" | "merchant_qr" | "agent_cash_in" | "bill_payment" | "airtime_topup" | "betting_topup";
  reference: string;
  providerId?: string;
  customerAccount?: string;
  metadata?: Record<string, string>;
}

export interface Transaction {
  id: string;
  payerWalletId: string;
  payeeWalletId: string;
  amountMinor: number;
  currency: Currency;
  status: TransactionStatus;
  providerId?: string;
  customerAccount?: string;
  riskScore: number;
  amlFlags: string[];
  reference: string;
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: ProviderCategory;
  settlementWalletId: string;
  status: ProviderStatus;
  commissionBps: number;
  complianceTier: "standard" | "enhanced";
  customerReferenceLabel: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  settlementWalletId: string;
  complianceTier: "standard" | "enhanced";
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  ipAddress: string;
  createdAt: string;
}
