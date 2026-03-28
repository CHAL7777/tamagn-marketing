"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function getMyServiceProviderId() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("service_provider_id")
    .eq("id", user.id)
    .maybeSingle();
  return p?.service_provider_id ?? null;
}

export async function createServiceListing(formData: FormData): Promise<void> {
  const spId = await getMyServiceProviderId();
  if (!spId) throw new Error("Not a service provider");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceMin = String(formData.get("price_min") ?? "").trim();
  const priceMax = String(formData.get("price_max") ?? "").trim();
  const prepaid = formData.get("prepaid_escrow") === "on";

  if (!title) throw new Error("Title required");

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("service_listings")
    .insert({
      service_provider_id: spId,
      title,
      description: description || null,
      price_min: priceMin || null,
      price_max: priceMax || null,
      prepaid_escrow: prepaid,
    })
    .select("id")
    .single();

  if (error || !listing) throw new Error(error?.message ?? "Failed");

  const area = String(formData.get("area") ?? "").trim();
  if (area) {
    await supabase.from("service_areas").insert({
      service_listing_id: listing.id,
      area_label: area,
    });
  }

  revalidatePath("/service-provider/services");
  revalidatePath("/services");
}
