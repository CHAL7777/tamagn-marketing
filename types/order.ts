/** Matches DB enum `order_status`. */
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

export type Order = {
  id: string;
  buyerId: string;
  status: OrderStatus;
};
