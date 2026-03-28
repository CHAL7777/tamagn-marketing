"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { orderId: string };

export function PayWithMpesaButton({ orderId }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/payments/mpesa-stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        customerMessage?: string;
      };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Payment failed");
        return;
      }
      setMsg(data.customerMessage ?? "Check your phone to complete M-Pesa.");
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={pay} disabled={loading}>
        {loading ? "Sending STK…" : "Pay with M-Pesa"}
      </Button>
      {msg ? <p className="text-sm leading-6 text-secondary">{msg}</p> : null}
    </div>
  );
}
