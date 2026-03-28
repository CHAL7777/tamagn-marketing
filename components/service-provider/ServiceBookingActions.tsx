"use client";

import { useTransition } from "react";
import { serviceProviderMarkDelivered } from "@/app/actions/service-orders";
import { Button } from "@/components/ui/button";

type Props = { orderId: string; status: string };

export function ServiceBookingActions({ orderId, status }: Props) {
  const [p, start] = useTransition();

  if (status !== "paid_escrow") {
    return status === "awaiting_payment" ? (
      <p className="text-xs text-muted-foreground">Awaiting buyer payment.</p>
    ) : null;
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={p}
      onClick={() => start(() => serviceProviderMarkDelivered(orderId))}
    >
      {p ? "Saving…" : "Mark work complete (buyer can confirm)"}
    </Button>
  );
}
