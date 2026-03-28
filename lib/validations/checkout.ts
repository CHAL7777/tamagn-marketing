import { z } from "zod";
import { fdString } from "@/lib/validations/form-data";

export const checkoutProductSchema = z.object({
  product_id: z.string().uuid("Invalid product"),
  quantity: z.coerce.number().int().min(1).max(9999),
  address_id: z.string().uuid("Invalid address"),
});

export function parseCheckoutProductForm(formData: FormData) {
  return checkoutProductSchema.safeParse({
    product_id: fdString(formData, "product_id"),
    quantity: fdString(formData, "quantity") || "1",
    address_id: fdString(formData, "address_id"),
  });
}
