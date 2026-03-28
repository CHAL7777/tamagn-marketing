"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseSignInForm,
  parseSignUpForm,
} from "@/lib/validations/auth";

export type AuthFormState = { error?: string; ok?: boolean } | null;

export async function signInWithEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = parseSignInForm(formData);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.email?.[0] ?? msg.password?.[0] ?? msg.next?.[0] ?? "Invalid input";
    return { error: first };
  }

  const { email, password, next } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = parseSignUpForm(formData);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.email?.[0] ?? msg.password?.[0] ?? msg.full_name?.[0] ?? "Invalid input";
    return { error: first };
  }

  const { email, password, full_name: fullName } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || undefined } },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  if (data.session) {
    redirect("/buyer/dashboard");
  }
  return {
    ok: true,
    error:
      "Check your email to confirm your account, then sign in.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function submitMerchantApplication(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in" };

  const businessName = String(formData.get("business_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationLabel = String(formData.get("location_label") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!businessName) return { error: "Business name required" };

  const { error } = await supabase.from("merchant_applications").insert({
    applicant_id: user.id,
    business_name: businessName,
    description: description || null,
    location_label: locationLabel || null,
    phone: phone || null,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/choose-role");
  return { ok: true };
}
