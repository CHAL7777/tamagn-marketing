"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
    .single();
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
