export async function holdFunds(_orderId: string) {
  return { ok: true as const };
}

export async function releaseFunds(_orderId: string) {
  return { ok: true as const };
}
