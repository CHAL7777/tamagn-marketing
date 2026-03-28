import { randomUUID } from "crypto";
import type {
  B2CPaymentApiBody,
  B2CPaymentInput,
  MpesaStkCallbackBody,
  ReversalApiBody,
  ReversalInput,
  StkPushApiBody,
  StkPushInput,
  StkPushProcessResponse,
} from "@/types/mpesa";
import {
  mpesaB2cUrl,
  mpesaBaseUrl,
  mpesaReversalUrl,
  mpesaStkUrl,
  mpesaTokenUrl,
} from "@/lib/mpesa/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

/**
 * Normalize to international MSISDN using `MPESA_MSISDN_COUNTRY_CODE` (default `254` Kenya, `251` Ethiopia).
 */
export function normalizeMsisdn(phone: string): string {
  const prefix =
    process.env.MPESA_MSISDN_COUNTRY_CODE?.trim().replace(/^\+/, "") ||
    "254";
  const d = phone.replace(/\s+/g, "");
  if (d.startsWith(prefix)) return d;
  if (d.startsWith("0")) return `${prefix}${d.slice(1)}`;
  if (prefix === "254" && d.startsWith("7") && d.length === 9) return `254${d}`;
  if (prefix === "251" && /^\d{9}$/.test(d)) return `251${d}`;
  return d;
}

function stkPassword(
  shortcode: string,
  passkey: string,
  timestamp: string
): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function formatTimestamp(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}` +
    `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`
  );
}

function merchantRequestIdForStk(input: StkPushInput): string | undefined {
  if (input.merchantRequestId?.trim()) return input.merchantRequestId.trim();
  const prefix = process.env.MPESA_STK_MERCHANT_REQUEST_PREFIX?.trim();
  if (prefix) return `${prefix}-${randomUUID()}`;
  const path = process.env.MPESA_STK_PATH?.trim() || "";
  if (path.includes("/v3/") || path.includes("v3/process"))
    return `order-${randomUUID()}`;
  return undefined;
}

export async function getMpesaAccessToken(): Promise<string> {
  const key = requireEnv("MPESA_CONSUMER_KEY");
  const secret = requireEnv("MPESA_CONSUMER_SECRET");
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(mpesaTokenUrl(), {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`M-Pesa OAuth failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("M-Pesa OAuth: no access_token");
  return data.access_token;
}

export type StkPushResult =
  | {
      ok: true;
      merchantRequestId: string;
      checkoutRequestId: string;
      customerMessage?: string;
    }
  | { ok: false; error: string; response?: StkPushProcessResponse };

/**
 * STK Push (C2B / Lipa na M-Pesa Online). Server-only.
 * Paths differ by market — set `MPESA_BASE_URL`, `MPESA_OAUTH_PATH`, `MPESA_STK_PATH` (see README).
 */
export async function initiateStkPush(
  input: StkPushInput
): Promise<StkPushResult> {
  try {
    const shortcode = requireEnv("MPESA_SHORTCODE");
    const passkey = requireEnv("MPESA_PASSKEY");
    const callbackUrl = requireEnv("MPESA_CALLBACK_URL");
    const txType =
      process.env.MPESA_TRANSACTION_TYPE?.trim() || "CustomerPayBillOnline";

    const token = await getMpesaAccessToken();
    const timestamp = formatTimestamp();
    const phone = normalizeMsisdn(input.phone);
    const merchantRequestId = merchantRequestIdForStk(input);

    const body: StkPushApiBody = {
      ...(merchantRequestId ? { MerchantRequestID: merchantRequestId } : {}),
      BusinessShortCode: shortcode,
      Password: stkPassword(shortcode, passkey, timestamp),
      Timestamp: timestamp,
      TransactionType: txType,
      Amount: Math.round(input.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.transactionDesc.slice(0, 13),
      ...(input.referenceData?.length
        ? { ReferenceData: input.referenceData }
        : {}),
    };

    const res = await fetch(mpesaStkUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });

    const json = (await res.json()) as StkPushProcessResponse;
    if (json.ResponseCode === "0" && json.CheckoutRequestID) {
      return {
        ok: true,
        merchantRequestId: json.MerchantRequestID ?? merchantRequestId ?? "",
        checkoutRequestId: json.CheckoutRequestID,
        customerMessage: json.CustomerMessage,
      };
    }
    return {
      ok: false,
      error: json.CustomerMessage || json.ResponseDescription || "STK failed",
      response: json,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "STK error";
    return { ok: false, error: message };
  }
}

export type B2CResult =
  | { ok: true; raw: unknown }
  | { ok: false; error: string; raw?: unknown };

/**
 * B2C business payment (e.g. escrow payout to seller). Server-only.
 */
export async function initiateB2CPayout(
  input: B2CPaymentInput
): Promise<B2CResult> {
  try {
    const initiator = requireEnv("MPESA_INITIATOR_NAME");
    const credential = requireEnv("MPESA_SECURITY_CREDENTIAL");
    const partyA = requireEnv("MPESA_B2C_PARTY_A");
    const queueUrl = requireEnv("MPESA_B2C_QUEUE_TIMEOUT_URL");
    const resultUrl = requireEnv("MPESA_B2C_RESULT_URL");
    const commandId =
      input.commandId?.trim() ||
      process.env.MPESA_B2C_COMMAND_ID?.trim() ||
      "BusinessPayment";

    const token = await getMpesaAccessToken();
    const partyB = normalizeMsisdn(input.partyB);
    const originatorId =
      input.originatorConversationId?.trim() ||
      `payout-${randomUUID()}`;

    const body: B2CPaymentApiBody = {
      OriginatorConversationID: originatorId,
      InitiatorName: initiator,
      SecurityCredential: credential,
      CommandID: commandId,
      PartyA: partyA,
      PartyB: partyB,
      Amount: Math.round(input.amount),
      Remarks: (input.remarks ?? "Payout").slice(0, 100),
      Occassion: (input.occasion ?? "Payout").slice(0, 100),
      QueueTimeOutURL: queueUrl,
      ResultURL: resultUrl,
    };

    const res = await fetch(mpesaB2cUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });

    const raw = (await res.json()) as unknown;
    if (!res.ok) {
      return { ok: false, error: `B2C HTTP ${res.status}`, raw };
    }
    return { ok: true, raw };
  } catch (e) {
    const message = e instanceof Error ? e.message : "B2C error";
    return { ok: false, error: message };
  }
}

export type ReversalResult =
  | { ok: true; raw: unknown }
  | { ok: false; error: string; raw?: unknown };

/**
 * Transaction reversal. Server-only. Confirm path/version for your market (`MPESA_REVERSAL_PATH`).
 */
export async function initiateReversal(
  input: ReversalInput
): Promise<ReversalResult> {
  try {
    const initiator =
      process.env.MPESA_REVERSAL_INITIATOR?.trim() ||
      requireEnv("MPESA_INITIATOR_NAME");
    const credential =
      process.env.MPESA_REVERSAL_SECURITY_CREDENTIAL?.trim() ||
      requireEnv("MPESA_SECURITY_CREDENTIAL");
    const partyA =
      process.env.MPESA_REVERSAL_PARTY_A?.trim() ||
      requireEnv("MPESA_B2C_PARTY_A");
    const resultUrl = requireEnv("MPESA_REVERSAL_RESULT_URL");
    const queueUrl = requireEnv("MPESA_REVERSAL_QUEUE_TIMEOUT_URL");
    const receiverType =
      process.env.MPESA_REVERSAL_RECEIVER_ID_TYPE?.trim() || "4";

    const token = await getMpesaAccessToken();
    const originatorId =
      input.originatorConversationId?.trim() ||
      `reversal-${randomUUID()}`;

    const body: ReversalApiBody = {
      OriginatorConversationID: originatorId,
      Initiator: initiator,
      SecurityCredential: credential,
      CommandID: "TransactionReversal",
      TransactionID: input.transactionId,
      Amount: Math.round(input.amount),
      ...(input.originalConversationId
        ? { OriginalConversationID: input.originalConversationId }
        : {}),
      PartyA: partyA,
      RecieverIdentifierType: receiverType,
      ReceiverParty: normalizeMsisdn(input.receiverParty),
      ResultURL: resultUrl,
      QueueTimeOutURL: queueUrl,
      Remarks: (input.remarks ?? "Reversal").slice(0, 100),
      Occasion: (input.occasion ?? "Reversal").slice(0, 100),
    };

    const res = await fetch(mpesaReversalUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });

    const raw = (await res.json()) as unknown;
    if (!res.ok) {
      return { ok: false, error: `Reversal HTTP ${res.status}`, raw };
    }
    return { ok: true, raw };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reversal error";
    return { ok: false, error: message };
  }
}

export type ParsedStkCallback = {
  success: boolean;
  resultCode: number;
  resultDesc?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceipt?: string;
  amount?: number;
  phone?: string;
};

/** Read STK callback JSON (Safaricom posts to your CallBackURL). */
export function parseStkCallbackResult(raw: unknown): ParsedStkCallback {
  const body = raw as MpesaStkCallbackBody;
  const cb = body?.Body?.stkCallback;
  if (!cb) {
    return { success: false, resultCode: -1, resultDesc: "Invalid callback" };
  }

  const resultCode = cb.ResultCode ?? -1;
  const items = cb.CallbackMetadata?.Item ?? [];
  const byName = (n: string) =>
    items.find((i) => i.Name === n)?.Value as string | number | undefined;

  const receiptRaw = byName("MpesaReceiptNumber");
  const amountRaw = byName("Amount");
  const phoneRaw = byName("PhoneNumber");

  return {
    success: resultCode === 0,
    resultCode,
    resultDesc: cb.ResultDesc,
    checkoutRequestId: cb.CheckoutRequestID,
    merchantRequestId: cb.MerchantRequestID,
    mpesaReceipt: receiptRaw != null ? String(receiptRaw) : undefined,
    amount:
      amountRaw != null
        ? typeof amountRaw === "number"
          ? amountRaw
          : Number(amountRaw)
        : undefined,
    phone: phoneRaw != null ? String(phoneRaw) : undefined,
  };
}

/** @deprecated use `mpesaBaseUrl` from `@/lib/mpesa/config` */
export function getMpesaBaseUrl(): string {
  return mpesaBaseUrl();
}
