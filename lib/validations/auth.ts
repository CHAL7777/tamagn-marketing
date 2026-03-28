import { z } from "zod";
import { fdString } from "@/lib/validations/form-data";

/**
 * Relative in-app paths only (blocks open redirects).
 * Rejects protocol-relative (`//host`), schemes, backslashes, and control chars.
 */
export function isSafeInternalPath(p: string): boolean {
  if (p === "/") return true;
  if (!p.startsWith("/")) return false;
  if (p.startsWith("//")) return false;
  if (p.includes("://")) return false;
  if (p.includes("\\")) return false;
  if (/[\r\n\0]/.test(p)) return false;
  return true;
}

export const nextPathSchema = z
  .string()
  .min(1)
  .refine(isSafeInternalPath, { message: "Invalid redirect" });

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Email required").email("Invalid email"),
  password: z.string().min(1, "Password required"),
  next: nextPathSchema,
});

export const signUpSchema = z.object({
  email: z.string().trim().min(1, "Email required").email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
  full_name: z.string().trim().max(200).optional().default(""),
  next: nextPathSchema,
});

export function parseSignInForm(formData: FormData) {
  const nextRaw = fdString(formData, "next").trim() || "/";
  return signInSchema.safeParse({
    email: fdString(formData, "email"),
    password: fdString(formData, "password"),
    next: nextRaw,
  });
}

export function parseSignUpForm(formData: FormData) {
  const nextRaw = fdString(formData, "next").trim() || "/";
  return signUpSchema.safeParse({
    email: fdString(formData, "email"),
    password: fdString(formData, "password"),
    full_name: fdString(formData, "full_name"),
    next: nextRaw,
  });
}

export const resendConfirmationSchema = z.object({
  email: z.string().trim().min(1, "Email required").email("Invalid email"),
  next: nextPathSchema,
});

export function parseResendConfirmationForm(formData: FormData) {
  const nextRaw = fdString(formData, "next").trim() || "/";
  return resendConfirmationSchema.safeParse({
    email: fdString(formData, "email"),
    next: nextRaw,
  });
}
