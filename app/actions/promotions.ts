"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function createPromotion(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const merchantId = String(formData.get("merchant_id") ?? "").trim();
  const promotionType = String(formData.get("promotion_type") ?? "store") as
    | "store"
    | "product"
    | "featured_merchant";
  const amountPaid = String(formData.get("amount_paid") ?? "0");
  const endsAt = String(formData.get("ends_at") ?? "").trim();

  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("merchant_id")
    .eq("id", user.id)
    .maybeSingle();
  if (p?.merchant_id !== merchantId) throw new Error("Forbidden");

  const { data: row, error } = await supabase
    .from("promotions")
    .insert({
      merchant_id: merchantId,
      promotion_type: promotionType,
      amount_paid: amountPaid,
      status: "pending",
      ends_at: endsAt ? new Date(endsAt).toISOString() : new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !row) throw new Error(error?.message ?? "Failed");

  revalidatePath("/merchant/promotions");
  redirect(`/merchant/promotions?pay=${row.id}`);
}
