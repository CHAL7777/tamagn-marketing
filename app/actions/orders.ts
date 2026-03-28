"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { recomputeMerchantTrust } from "@/lib/reputation";
import { tryAutoReleaseEscrow } from "@/lib/escrow-release";

const MERCHANT_FLOW: Record<string, string> = {
  paid_escrow: "merchant_confirmed",
  merchant_confirmed: "pickup_scheduled",
  pickup_scheduled: "collected",
};

export async function merchantAdvanceOrder(orderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, merchant_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order?.merchant_id) throw new Error("Order not found");
  const { data: merch } = await supabase
    .from("merchants")
    .select("owner_id")
    .eq("id", order.merchant_id)
    .maybeSingle();
  if (!merch || merch.owner_id !== user.id) throw new Error("Forbidden");

  const next = MERCHANT_FLOW[order.status];
  if (!next) throw new Error("Invalid transition");

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: next,
    note: "Merchant update",
    created_by: user.id,
  });

  revalidatePath("/merchant/orders");
  revalidatePath(`/buyer/order/${orderId}`);
}

export async function courierAdvanceDelivery(
  orderId: string,
  eventHint: string
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: courier } = await supabase
    .from("couriers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!courier) throw new Error("Not a courier");

  const { data: da } = await supabase
    .from("delivery_assignments")
    .select("id")
    .eq("order_id", orderId)
    .eq("courier_id", courier.id)
    .maybeSingle();
  if (!da) throw new Error("No assignment");

  const flow: Record<string, string> = {
    collected: "in_transit",
    in_transit: "delivered",
  };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const next = flow[order?.status ?? ""] ?? order?.status;
  if (!next || next === order?.status) {
    await supabase.from("delivery_events").insert({
      assignment_id: da.id,
      event_type: eventHint || "update",
    });
    return;
  }

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: next,
    note: `Courier: ${eventHint}`,
    created_by: user.id,
  });
  await supabase.from("delivery_events").insert({
    assignment_id: da.id,
    event_type: next,
  });

  revalidatePath("/buyer/orders");
  revalidatePath(`/buyer/order/${orderId}`);
}

export async function buyerConfirmDelivery(orderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, buyer_id, merchant_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) throw new Error("Forbidden");
  if (order.status !== "delivered") throw new Error("Not delivered yet");

  await supabase
    .from("orders")
    .update({
      status: "completed",
      buyer_confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "completed",
    note: "Buyer confirmed receipt",
    created_by: user.id,
  });

  if (order.merchant_id) {
    await recomputeMerchantTrust(order.merchant_id);
  }

  await tryAutoReleaseEscrow(orderId);

  revalidatePath(`/buyer/order/${orderId}`);
}

export async function openDispute(orderId: string, evidence: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) throw new Error("Forbidden");

  await supabase.from("disputes").insert({
    order_id: orderId,
    opened_by: user.id,
    status: "open",
    evidence_urls: evidence ? [evidence] : [],
  });

  await supabase.from("orders").update({ status: "disputed" }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "disputed",
    note: "Dispute opened",
    created_by: user.id,
  });

  revalidatePath(`/buyer/order/${orderId}`);
}

export async function submitReview(
  orderId: string,
  rating: number,
  body: string
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, buyer_id, status, merchant_id, service_listing_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) throw new Error("Forbidden");
  if (order.status !== "completed") throw new Error("Order not completed");

  await supabase.from("reviews").insert({
    order_id: orderId,
    reviewer_id: user.id,
    merchant_id: order.merchant_id,
    service_provider_id: null,
    rating,
    body: body || null,
  });

  if (order.merchant_id) {
    await recomputeMerchantTrust(order.merchant_id);
  }

  revalidatePath(`/buyer/order/${orderId}`);
}
