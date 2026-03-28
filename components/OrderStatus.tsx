type Props = { status: string };

export function OrderStatus({ status }: Props) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs" data-status={status}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
