import type { OrderStatus as Status } from "@/types/order";

type Props = { status: Status };

export function OrderStatus({ status }: Props) {
  return <span data-status={status}>{status}</span>;
}
