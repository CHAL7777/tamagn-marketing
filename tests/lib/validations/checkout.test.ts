import { describe, expect, it } from "vitest";
import { checkoutProductSchema, parseCheckoutProductForm } from "@/lib/validations/checkout";

const validIds = {
  product_id: "550e8400-e29b-41d4-a716-446655440000",
  address_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
};

describe("checkoutProductSchema", () => {
  it("accepts valid payload", () => {
    const r = checkoutProductSchema.safeParse({
      ...validIds,
      quantity: 2,
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    const r = checkoutProductSchema.safeParse({
      product_id: "not-a-uuid",
      address_id: validIds.address_id,
      quantity: 1,
    });
    expect(r.success).toBe(false);
  });
});

describe("parseCheckoutProductForm", () => {
  it("coerces quantity from string", () => {
    const fd = new FormData();
    fd.set("product_id", validIds.product_id);
    fd.set("address_id", validIds.address_id);
    fd.set("quantity", "3");
    const r = parseCheckoutProductForm(fd);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.quantity).toBe(3);
  });
});
