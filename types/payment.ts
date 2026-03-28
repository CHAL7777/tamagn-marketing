export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  provider: "mpesa";
  status: "pending" | "completed" | "failed";
};
