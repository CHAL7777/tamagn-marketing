import { z } from "zod";
import { fdString } from "@/lib/validations/form-data";

/** Relative in-app paths only (blocks open redirects). */
export const nextPathSchema = z
  .string()
  .min(1)
  .refine((p) => p.startsWith("/"), { message: "Invalid redirect" });

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
  return signUpSchema.safeParse({
    email: fdString(formData, "email"),
    password: fdString(formData, "password"),
    full_name: fdString(formData, "full_name"),
  });
}
