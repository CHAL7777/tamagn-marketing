"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { orderHasActiveDispute } from "@/lib/disputes";
import {
  canBuyerConfirmDelivery,
  canOpenDispute,
  canSubmitReview,
  getCourierNextStatus,
  getMerchantNextStatus,
} from "@/lib/orders/workflow";
import {
  recomputeMerchantTrust,
  recomputeServiceProviderTrust,
} from "@/lib/reputation";
import { tryAutoReleaseEscrow } from "@/lib/escrow-release";

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

  const { data: assignment } = await supabase
    .from("delivery_assignments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  const transition = getMerchantNextStatus(order.status, Boolean(assignment));
  if (!transition.ok) throw new Error(transition.error);

  const next = transition.next;

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: next,
    note:
      next === "merchant_confirmed"
        ? "Merchant confirmed order"
        : next === "pickup_scheduled"
          ? "Courier pickup scheduled"
          : "Order collected for delivery",
    created_by: user.id,
  });

  if (assignment?.id && next === "collected") {
    await supabase
      .from("delivery_assignments")
      .update({ status: "collected" })
      .eq("id", assignment.id);
    await supabase.from("delivery_events").insert({
      assignment_id: assignment.id,
      event_type: "collected",
    });
  }

  revalidatePath("/merchant/orders");
  revalidatePath("/courier/deliveries");
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

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const transition = getCourierNextStatus(order?.status ?? "");
  if (!transition.ok) throw new Error(transition.error);

  const next = transition.next;

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: next,
    note: `Courier: ${eventHint}`,
    created_by: user.id,
  });
  await supabase
    .from("delivery_assignments")
    .update({ status: next })
    .eq("id", da.id);
  await supabase.from("delivery_events").insert({
    assignment_id: da.id,
    event_type: next,
  });

  revalidatePath("/buyer/orders");
  revalidatePath("/courier/deliveries");
  revalidatePath(`/buyer/order/${orderId}`);
}

export async function buyerConfirmDelivery(orderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, buyer_id, merchant_id, service_listing_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) throw new Error("Forbidden");
  if (!canBuyerConfirmDelivery(order.status)) throw new Error("Not delivered yet");

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
  if (order.service_listing_id) {
    const { data: sl } = await supabase
      .from("service_listings")
      .select("service_provider_id")
      .eq("id", order.service_listing_id)
      .maybeSingle();
    if (sl?.service_provider_id) {
      await recomputeServiceProviderTrust(sl.service_provider_id);
    }
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
  if (!canOpenDispute(order.status)) {
    throw new Error("Order is not eligible for a dispute yet");
  }
  if (await orderHasActiveDispute(supabase, orderId)) {
    throw new Error("An active dispute already exists for this order");
  }

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
  if (!canSubmitReview(order.status)) throw new Error("Order not completed");

  const safeRating = Math.trunc(rating);
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  let serviceProviderId: string | null = null;
  if (order.service_listing_id) {
    const { data: sl } = await supabase
      .from("service_listings")
      .select("service_provider_id")
      .eq("id", order.service_listing_id)
      .maybeSingle();
    serviceProviderId = sl?.service_provider_id ?? null;
  }

  await supabase.from("reviews").insert({
    order_id: orderId,
    reviewer_id: user.id,
    merchant_id: order.merchant_id,
    service_provider_id: serviceProviderId,
    rating: safeRating,
    body: body.trim() || null,
  });

  if (order.merchant_id) {
    await recomputeMerchantTrust(order.merchant_id);
  }
  if (serviceProviderId) {
    await recomputeServiceProviderTrust(serviceProviderId);
  }

  revalidatePath(`/buyer/order/${orderId}`);
}
