import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateStkPush } from "@/lib/mpesa";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  }

  const { data: order, error: oe } = await supabase
    .from("orders")
    .select("id, buyer_id, total, status, mpesa_checkout_request_id")
    .eq("id", orderId)
    .maybeSingle();

  if (oe || !order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  if (order.buyer_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "awaiting_payment") {
    return NextResponse.json(
      { ok: false, error: "Order not awaiting payment" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("mpesa_msisdn, phone")
    .eq("id", user.id)
    .maybeSingle();

  const phone = profile?.mpesa_msisdn || profile?.phone;
  if (!phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Add M-Pesa number in buyer profile" },
      { status: 400 }
    );
  }

  const amount = Number(order.total);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid order total" }, { status: 400 });
  }

  const result = await initiateStkPush({
    amount,
    phone: phone.trim(),
    accountReference: orderId.slice(0, 12),
    transactionDesc: "Order pay",
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, response: result.response },
      { status: 502 }
    );
  }

  await supabase
    .from("orders")
    .update({ mpesa_checkout_request_id: result.checkoutRequestId })
    .eq("id", orderId);

  await supabase.from("payments").insert({
    order_id: orderId,
    amount: String(amount),
    mpesa_checkout_request_id: result.checkoutRequestId,
    status: "pending",
  });

  return NextResponse.json({
    ok: true,
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    customerMessage: result.customerMessage,
  });
}
