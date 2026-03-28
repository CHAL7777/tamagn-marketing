"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export type ServiceReqState = { error?: string; ok?: boolean } | null;

export async function submitServiceRequest(
  serviceListingId: string,
  _prev: ServiceReqState,
  formData: FormData
): Promise<ServiceReqState> {
  const user = await getUser();
  if (!user) return { error: "Sign in required" };

  const message = String(formData.get("message") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.from("service_requests").insert({
    service_listing_id: serviceListingId,
    buyer_id: user.id,
    message: message || null,
    status: "pending",
  });
  if (error) return { error: error.message };
  revalidatePath(`/services/${serviceListingId}`);
  revalidatePath("/service-provider/requests");
  return { ok: true };
}
