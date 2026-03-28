"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { merchantAdvanceOrder } from "@/app/actions/orders";

const CAN_ADVANCE = [
  "paid_escrow",
  "merchant_confirmed",
  "pickup_scheduled",
];

type Props = {
  orderId: string;
  status: string;
};

export function MerchantOrderActions({ orderId, status }: Props) {
  const [pending, start] = useTransition();

  if (!CAN_ADVANCE.includes(status)) return null;

  return (
    <Button
      type="button"
      className="mt-3"
      size="sm"
      disabled={pending}
      onClick={() => start(() => merchantAdvanceOrder(orderId))}
    >
      {pending ? "Updating…" : "Advance status"}
    </Button>
  );
}
