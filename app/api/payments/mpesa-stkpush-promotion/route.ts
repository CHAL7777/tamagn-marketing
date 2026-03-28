import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateStkPush } from "@/lib/mpesa";

/** Merchant pays boost fee via STK; callback activates promotion. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { promotionId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const promotionId = body.promotionId?.trim();
  if (!promotionId) {
    return NextResponse.json({ ok: false, error: "promotionId required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("merchant_id, mpesa_msisdn, phone")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.merchant_id) {
    return NextResponse.json({ ok: false, error: "Not a merchant" }, { status: 403 });
  }

  const { data: promo, error: pe } = await supabase
    .from("promotions")
    .select("id, merchant_id, amount_paid, status, mpesa_checkout_request_id")
    .eq("id", promotionId)
    .maybeSingle();

  if (pe || !promo) {
    return NextResponse.json({ ok: false, error: "Promotion not found" }, { status: 404 });
  }
  if (promo.merchant_id !== profile.merchant_id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (promo.status !== "pending") {
    return NextResponse.json(
      { ok: false, error: "Promotion not payable" },
      { status: 400 }
    );
  }

  const phone = profile.mpesa_msisdn || profile.phone;
  if (!phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Add M-Pesa number to your profile" },
      { status: 400 }
    );
  }

  const amount = Number(promo.amount_paid);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
  }

  const result = await initiateStkPush({
    amount,
    phone: phone.trim(),
    accountReference: `boost-${promotionId.slice(0, 8)}`,
    transactionDesc: "Store boost",
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, response: result.response },
      { status: 502 }
    );
  }

  await supabase
    .from("promotions")
    .update({ mpesa_checkout_request_id: result.checkoutRequestId })
    .eq("id", promotionId);

  return NextResponse.json({
    ok: true,
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    customerMessage: result.customerMessage,
  });
}
