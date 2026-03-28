/** Normalize `FormData.get` for Zod (string fields only). */
export function fdString(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v == null) return "";
  if (typeof v === "string") return v;
  return "";
}
