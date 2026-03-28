export type OrderStatus =
  | "pending_payment"
  | "paid_escrow"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  buyerId: string;
  status: OrderStatus;
};
