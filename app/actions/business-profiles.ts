"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function updateMerchantProfile(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.merchant_id) {
    throw new Error("Merchant profile not linked");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  if (!businessName) {
    throw new Error("Business name is required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("merchants")
    .update({
      business_name: businessName,
      description: optionalText(formData, "description"),
      location_label: optionalText(formData, "location_label"),
      latitude: optionalNumber(formData, "latitude"),
      longitude: optionalNumber(formData, "longitude"),
    })
    .eq("id", profile.merchant_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/merchant/profile");
  revalidatePath("/merchant/dashboard");
  revalidatePath("/products");
}

export async function updateServiceProviderProfile(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.service_provider_id) {
    throw new Error("Service provider profile not linked");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  if (!businessName) {
    throw new Error("Business name is required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_providers")
    .update({
      business_name: businessName,
      bio: optionalText(formData, "bio"),
      latitude: optionalNumber(formData, "latitude"),
      longitude: optionalNumber(formData, "longitude"),
    })
    .eq("id", profile.service_provider_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/service-provider/profile");
  revalidatePath("/service-provider/dashboard");
  revalidatePath("/services");
}
