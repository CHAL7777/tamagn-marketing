"use client";

type Props = { label?: string; onPay?: () => void };

export function PaymentButton({ label = "Pay with M-Pesa", onPay }: Props) {
  return (
    <button type="button" onClick={onPay}>
      {label}
    </button>
  );
}
