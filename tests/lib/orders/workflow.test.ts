import { describe, expect, it } from "vitest";
import {
  canAssignCourier,
  canBuyerConfirmDelivery,
  canOpenDispute,
  canSubmitReview,
  deliveryAssignmentStatusForOrder,
  getCourierNextStatus,
  getMerchantNextStatus,
  getServiceProviderNextStatus,
  nextStatusAfterCourierAssignment,
} from "@/lib/orders/workflow";

describe("merchant workflow", () => {
  it("moves paid escrow orders to merchant confirmed", () => {
    expect(getMerchantNextStatus("paid_escrow", false)).toEqual({
      ok: true,
      next: "merchant_confirmed",
    });
  });

  it("requires a courier assignment before pickup scheduling", () => {
    expect(getMerchantNextStatus("merchant_confirmed", false)).toEqual({
      ok: false,
      error: "Assign a courier before moving the delivery forward",
    });
    expect(getMerchantNextStatus("merchant_confirmed", true)).toEqual({
      ok: true,
      next: "pickup_scheduled",
    });
  });

  it("requires a courier assignment before collection", () => {
    expect(getMerchantNextStatus("pickup_scheduled", false)).toEqual({
      ok: false,
      error: "Assign a courier before moving the delivery forward",
    });
    expect(getMerchantNextStatus("pickup_scheduled", true)).toEqual({
      ok: true,
      next: "collected",
    });
  });
});

describe("courier workflow", () => {
  it("moves collected orders to in transit and then delivered", () => {
    expect(getCourierNextStatus("collected")).toEqual({
      ok: true,
      next: "in_transit",
    });
    expect(getCourierNextStatus("in_transit")).toEqual({
      ok: true,
      next: "delivered",
    });
  });
});

describe("service provider workflow", () => {
  it("marks paid escrow service work as delivered", () => {
    expect(getServiceProviderNextStatus("paid_escrow")).toEqual({
      ok: true,
      next: "delivered",
    });
  });
});

describe("order workflow guards", () => {
  it("allows courier assignment only for product orders already in fulfillment", () => {
    expect(canAssignCourier("product", "merchant_confirmed")).toBe(true);
    expect(canAssignCourier("product", "awaiting_payment")).toBe(false);
    expect(canAssignCourier("service", "merchant_confirmed")).toBe(false);
  });

  it("derives assignment state from delivery state", () => {
    expect(nextStatusAfterCourierAssignment("merchant_confirmed")).toBe(
      "pickup_scheduled"
    );
    expect(deliveryAssignmentStatusForOrder("pickup_scheduled")).toBe("assigned");
    expect(deliveryAssignmentStatusForOrder("collected")).toBe("collected");
  });

  it("limits buyer dispute, confirmation, and review actions to the right states", () => {
    expect(canBuyerConfirmDelivery("delivered")).toBe(true);
    expect(canBuyerConfirmDelivery("completed")).toBe(false);
    expect(canOpenDispute("delivered")).toBe(true);
    expect(canOpenDispute("awaiting_payment")).toBe(false);
    expect(canSubmitReview("completed")).toBe(true);
    expect(canSubmitReview("delivered")).toBe(false);
  });
});
