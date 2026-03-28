"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { promotionId: string };

export function PayPromotionButton({ promotionId }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/payments/mpesa-stkpush-promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; customerMessage?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Payment failed");
      } else {
        setMsg(data.customerMessage ?? "Check your phone for the M-Pesa prompt.");
      }
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={loading} onClick={() => void pay()}>
        {loading ? "Sending…" : "Pay with M-Pesa"}
      </Button>
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
