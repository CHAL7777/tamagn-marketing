"use client";

import { useOrderRealtime } from "@/hooks/useOrderRealtime";

export function OrderRealtimeRefresh({ orderId }: { orderId: string }) {
  useOrderRealtime(orderId);
  return null;
}
