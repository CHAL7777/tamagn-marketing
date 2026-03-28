type Props = { status: string };

const styles: Record<string, string> = {
  awaiting_payment: "bg-tertiary-container/16 text-on-tertiary-container",
  paid_escrow: "bg-primary-fixed text-on-primary-fixed",
  merchant_confirmed: "bg-primary/12 text-primary",
  pickup_scheduled: "bg-primary/12 text-primary",
  collected: "bg-primary/12 text-primary",
  in_transit: "bg-primary text-on-primary",
  delivered: "bg-surface-container-low text-foreground",
  completed: "bg-primary-fixed text-on-primary-fixed",
  cancelled: "bg-error-container text-destructive",
  disputed: "bg-error-container text-destructive",
};

export function OrderStatus({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
        styles[status] ?? "bg-surface-container-low text-secondary"
      }`}
      data-status={status}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
