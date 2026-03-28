"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function addAddress(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const line1 = String(formData.get("line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const lat = formData.get("latitude");
  const lng = formData.get("longitude");
  const isDefault = formData.get("is_default") === "on";

  if (!line1 || !city) return;

  const supabase = await createClient();

  if (isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  await supabase.from("addresses").insert({
    user_id: user.id,
    line1,
    city,
    label: label || null,
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    is_default: isDefault,
  });

  revalidatePath("/buyer/profile");
}

export async function listAddressesForUser() {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });
  return data ?? [];
}
