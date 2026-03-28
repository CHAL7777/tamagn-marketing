export type OrderStatus =
  | "awaiting_payment"
  | "paid_escrow"
  | "merchant_confirmed"
  | "pickup_scheduled"
  | "collected"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

export type OrderType = "product" | "service";

type TransitionResult =
  | { ok: true; next: OrderStatus }
  | { ok: false; error: string };

const MERCHANT_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  paid_escrow: "merchant_confirmed",
  merchant_confirmed: "pickup_scheduled",
  pickup_scheduled: "collected",
};

const COURIER_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  collected: "in_transit",
  in_transit: "delivered",
};

const SERVICE_PROVIDER_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  paid_escrow: "delivered",
};

export function getMerchantNextStatus(
  status: string,
  hasCourierAssignment: boolean
): TransitionResult {
  const next = MERCHANT_FLOW[status as OrderStatus];
  if (!next) {
    return { ok: false, error: "Invalid transition" };
  }

  if (
    (status === "merchant_confirmed" || status === "pickup_scheduled") &&
    !hasCourierAssignment
  ) {
    return {
      ok: false,
      error: "Assign a courier before moving the delivery forward",
    };
  }

  return { ok: true, next };
}

export function getCourierNextStatus(status: string): TransitionResult {
  const next = COURIER_FLOW[status as OrderStatus];
  if (!next) {
    return { ok: false, error: "Invalid delivery transition" };
  }
  return { ok: true, next };
}

export function getServiceProviderNextStatus(status: string): TransitionResult {
  const next = SERVICE_PROVIDER_FLOW[status as OrderStatus];
  if (!next) {
    return { ok: false, error: "Order not in escrow for fulfillment" };
  }
  return { ok: true, next };
}

export function canAssignCourier(orderType: string, status: string) {
  return (
    orderType === "product" &&
    ["merchant_confirmed", "pickup_scheduled", "collected", "in_transit"].includes(
      status
    )
  );
}

export function nextStatusAfterCourierAssignment(status: string): OrderStatus {
  return status === "merchant_confirmed" ? "pickup_scheduled" : (status as OrderStatus);
}

export function deliveryAssignmentStatusForOrder(status: string) {
  if (status === "collected" || status === "in_transit" || status === "delivered") {
    return status;
  }
  return "assigned";
}

export function canBuyerConfirmDelivery(status: string) {
  return status === "delivered";
}

export function canOpenDispute(status: string) {
  return status === "delivered" || status === "completed";
}

export function canSubmitReview(status: string) {
  return status === "completed";
}
