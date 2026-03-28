import { requestEscrowRelease } from "@/lib/mpesa-payouts";

/** Attempt B2C payout to merchant or service provider after order is completed. Fails silently if env missing. */
export async function tryAutoReleaseEscrow(orderId: string) {
  try {
    await requestEscrowRelease(orderId, { auto: true });
  } catch {
    return;
  }
}
