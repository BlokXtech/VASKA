import crypto from "node:crypto";
import { config } from "../config.js";
import { ServiceProvider } from "../domain/types.js";

interface ProviderFulfilmentRequest {
  provider: ServiceProvider;
  amountMinor: number;
  customerAccount: string;
  operatorId: string;
}

export interface ProviderFulfilment {
  providerId: string;
  providerName: string;
  customerAccount: string;
  amountMinor: number;
  fulfilmentType: "electricity_token" | "airtime_pin" | "betting_pin" | "provider_reference";
  token: string;
  providerReference: string;
  message: string;
}

export async function fulfilProviderPayment(request: ProviderFulfilmentRequest): Promise<ProviderFulfilment> {
  const apiKey = getProviderApiKey(request.provider.id);
  const providerReference = `PV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Replace these mock branches with signed HTTPS calls to each provider API.
  // Keep provider API keys in AWS Secrets Manager or environment variables, never in source code.
  if (request.provider.category === "electricity") {
    return {
      ...baseFulfilment(request, providerReference),
      fulfilmentType: "electricity_token",
      token: generateGroupedPin(20),
      message: `Electricity token generated through ${maskKey(apiKey)}`
    };
  }

  if (request.provider.category === "betting") {
    return {
      ...baseFulfilment(request, providerReference),
      fulfilmentType: "betting_pin",
      token: generateGroupedPin(12),
      message: `Betting top-up PIN generated through ${maskKey(apiKey)}`
    };
  }

  if (request.provider.category === "airtime" || request.provider.category === "data") {
    return {
      ...baseFulfilment(request, providerReference),
      fulfilmentType: "airtime_pin",
      token: generateGroupedPin(14),
      message: `Airtime voucher generated through ${maskKey(apiKey)}`
    };
  }

  return {
    ...baseFulfilment(request, providerReference),
    fulfilmentType: "provider_reference",
    token: providerReference,
    message: `Provider payment accepted through ${maskKey(apiKey)}`
  };
}

function baseFulfilment(request: ProviderFulfilmentRequest, providerReference: string) {
  return {
    providerId: request.provider.id,
    providerName: request.provider.name,
    customerAccount: request.customerAccount,
    amountMinor: request.amountMinor,
    providerReference
  };
}

function getProviderApiKey(providerId: string) {
  const keys: Record<string, string> = {
    prv_city_power: config.providerKeys.electricity,
    prv_mtc: config.providerKeys.mtc,
    prv_telecom: config.providerKeys.telecom,
    prv_castlebet: config.providerKeys.castlebet,
    prv_jsb: config.providerKeys.jsb
  };

  return keys[providerId] ?? "mock-provider-key";
}

function generateGroupedPin(length: number) {
  const digits = Array.from({ length }, () => crypto.randomInt(0, 10)).join("");
  return digits.match(/.{1,4}/g)?.join("-") ?? digits;
}

function maskKey(key: string) {
  if (key.startsWith("mock-")) return "mock connector";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
