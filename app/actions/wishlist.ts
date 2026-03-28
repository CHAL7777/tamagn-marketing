"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function addToWishlist(productId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  const { error } = await supabase.from("wishlist_items").upsert(
    { user_id: user.id, product_id: productId },
    { onConflict: "user_id,product_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/buyer/wishlist");
  revalidatePath(`/products/${productId}`);
}

export async function addToWishlistForm(formData: FormData): Promise<void> {
  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return;
  await addToWishlist(productId);
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);
  revalidatePath("/buyer/wishlist");
}
