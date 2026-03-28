import { NextResponse } from "next/server";
import { parseStkCallbackResult } from "@/lib/mpesa";
import { recordStkCallbackForEscrow } from "@/lib/escrow";
import { recordStkCallbackForPromotion } from "@/lib/escrow-promotions";

/**
 * Safaricom posts STK callback here. Acknowledge quickly; persist via Supabase async/queue if needed.
 * Optional: set MPESA_CALLBACK_SECRET and send the same value in header `x-mpesa-callback-secret`.
 */
export async function POST(request: Request) {
  const secret = process.env.MPESA_CALLBACK_SECRET?.trim();
  if (secret) {
    const sent = request.headers.get("x-mpesa-callback-secret");
    if (sent !== secret) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
    }
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Bad JSON" });
  }

  const parsed = parseStkCallbackResult(raw);
  if (!parsed.checkoutRequestId) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });
  }

  await recordStkCallbackForEscrow(parsed);
  await recordStkCallbackForPromotion(parsed);

  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: "Success",
  });
}
