export async function assignCourier(_orderId: string, _courierId: string) {
  return { ok: true as const };
}

export async function trackShipment(_orderId: string) {
  return { status: "pending" as const };
}
