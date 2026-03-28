"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { normalizeMsisdn } from "@/lib/mpesa";

export async function updateMpesaMsisdn(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const raw = String(formData.get("mpesa_msisdn") ?? "").trim();
  const mpesa_msisdn = raw ? normalizeMsisdn(raw) : null;

  const supabase = await createClient();
  await supabase.from("profiles").update({ mpesa_msisdn }).eq("id", user.id);
  revalidatePath("/buyer/profile");
}
