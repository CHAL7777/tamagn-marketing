"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function getMyMerchantId() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("merchant_id")
    .eq("id", user.id)
    .maybeSingle();
  return p?.merchant_id ?? null;
}

export async function createProduct(formData: FormData): Promise<void> {
  const merchantId = await getMyMerchantId();
  if (!merchantId) throw new Error("Not a merchant");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const stock = Math.max(0, Number(formData.get("stock") ?? 0));
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;

  if (!title || !price) throw new Error("Title and price required");

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    merchant_id: merchantId,
    title,
    description: description || null,
    price,
    stock,
    category_id: categoryId,
    status: "active",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/merchant/products");
  revalidatePath("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const merchantId = await getMyMerchantId();
  if (!merchantId) throw new Error("Not a merchant");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("products")
    .select("merchant_id")
    .eq("id", productId)
    .maybeSingle();
  if (!row || row.merchant_id !== merchantId) throw new Error("Forbidden");

  const title = String(formData.get("title") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const stock = Math.max(0, Number(formData.get("stock") ?? 0));
  const status = String(formData.get("status") ?? "active") as
    | "draft"
    | "active"
    | "suspended";

  const { error } = await supabase
    .from("products")
    .update({
      title,
      price,
      stock,
      status,
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/merchant/products");
  revalidatePath("/products");
}
