import { recordReversalQueueTimeout } from "@/lib/mpesa-payouts";
import {
  acknowledgeMpesaCallback,
  ensureMpesaCallbackAuthorized,
  readMpesaCallbackJson,
} from "@/lib/mpesa-callback";

export async function POST(request: Request) {
  const unauthorized = ensureMpesaCallbackAuthorized(request);
  if (unauthorized) return unauthorized;

  const parsed = await readMpesaCallbackJson(request);
  if (!parsed.ok) return parsed.response;

  await recordReversalQueueTimeout(parsed.raw);
  return acknowledgeMpesaCallback();
}
