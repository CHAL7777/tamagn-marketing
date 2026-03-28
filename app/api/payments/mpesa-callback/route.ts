import { parseStkCallbackResult } from "@/lib/mpesa";
import {
  acknowledgeMpesaCallback,
  ensureMpesaCallbackAuthorized,
  readMpesaCallbackJson,
} from "@/lib/mpesa-callback";
import { recordStkCallbackForEscrow } from "@/lib/escrow";
import { recordStkCallbackForPromotion } from "@/lib/escrow-promotions";

/**
 * Safaricom posts STK callback here. Acknowledge quickly; persist via Supabase async/queue if needed.
 * Optional: set MPESA_CALLBACK_SECRET and send the same value in header `x-mpesa-callback-secret`.
 */
export async function POST(request: Request) {
  const unauthorized = ensureMpesaCallbackAuthorized(request);
  if (unauthorized) return unauthorized;

  const parsedBody = await readMpesaCallbackJson(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = parseStkCallbackResult(parsedBody.raw);
  if (!parsed.checkoutRequestId) {
    return acknowledgeMpesaCallback("Ignored");
  }

  await recordStkCallbackForEscrow(parsed);
  await recordStkCallbackForPromotion(parsed);

  return acknowledgeMpesaCallback();
}
