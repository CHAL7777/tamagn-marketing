/** Platform escrow lifecycle (map to `orders` + `payments` in Supabase). */
export type EscrowState =
  | "awaiting_payment"
  | "funds_pending"
  | "in_escrow"
  | "released"
  | "refunded"
  | "failed";
