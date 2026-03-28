"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { tryAutoReleaseEscrow } from "@/lib/escrow-release";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { user, userId: user.id };
}

/** Approve merchant application: create merchant row, link profile, mark application approved. */
export async function approveMerchantApplication(applicationId: string) {
  const { userId } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: app, error: appErr } = await admin
    .from("merchant_applications")
    .select("*")
    .eq("id", applicationId)
    .single();
  if (appErr || !app) throw new Error("Application not found");
  if (app.status !== "pending") throw new Error("Already processed");

  const { data: merchant, error: mErr } = await admin
    .from("merchants")
    .insert({
      owner_id: app.applicant_id,
      business_name: app.business_name,
      description: app.description,
      location_label: app.location_label,
      verification_badge: true,
      is_active: true,
    })
    .select("id")
    .single();
  if (mErr || !merchant) throw new Error(mErr?.message ?? "Merchant create failed");

  await admin
    .from("profiles")
    .update({
      role: "merchant",
      merchant_id: merchant.id,
    })
    .eq("id", app.applicant_id);

  await admin
    .from("merchant_applications")
    .update({
      status: "approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  revalidatePath("/admin/merchants");
  return { ok: true as const };
}

export async function rejectMerchantApplication(
  applicationId: string,
  note?: string
) {
  const { userId } = await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("merchant_applications")
    .update({
      status: "rejected",
      reviewed_by: userId,
      admin_note: note ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/merchants");
  return { ok: true as const };
}

type DisputeOutcome =
  | "release_to_merchant"
  | "refund_buyer"
  | "partial_refund";

export async function resolveDispute(
  disputeId: string,
  outcome: DisputeOutcome,
  resolutionNote: string
) {
  const { userId } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: dispute, error: de } = await admin
    .from("disputes")
    .select("id, order_id, status")
    .eq("id", disputeId)
    .maybeSingle();
  if (de || !dispute) throw new Error("Dispute not found");
  if (dispute.status === "resolved" || dispute.status === "closed") {
    throw new Error("Already resolved");
  }

  const orderId = dispute.order_id;

  await admin
    .from("disputes")
    .update({
      status: "resolved",
      outcome,
      resolution_note: resolutionNote || null,
      resolved_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  if (outcome === "release_to_merchant") {
    await admin
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);
    await admin.from("order_status_history").insert({
      order_id: orderId,
      status: "completed",
      note: "Dispute resolved: release to seller",
      created_by: userId,
    });
    await tryAutoReleaseEscrow(orderId);
  } else if (outcome === "partial_refund") {
    await admin
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);
    await admin.from("order_status_history").insert({
      order_id: orderId,
      status: "completed",
      note: "Dispute resolved: partial refund (settle payout manually)",
      created_by: userId,
    });
  } else if (outcome === "refund_buyer") {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await admin.from("order_status_history").insert({
      order_id: orderId,
      status: "cancelled",
      note: "Dispute: refund buyer",
      created_by: userId,
    });
  }

  revalidatePath("/admin/disputes");
  revalidatePath(`/buyer/order/${orderId}`);
  return { ok: true as const };
}

export async function setProductModerationStatus(
  productId: string,
  status: "active" | "suspended",
  reason?: string
) {
  const { userId } = await ensureAdmin();
  const supabase = await createClient();

  const { error: ue } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId);
  if (ue) throw new Error(ue.message);

  await supabase.from("moderation_actions").insert({
    product_id: productId,
    admin_id: userId,
    action: status === "suspended" ? "suspend" : "restore",
    reason: reason ?? null,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true as const };
}
