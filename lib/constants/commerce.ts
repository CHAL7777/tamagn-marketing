/** Platform commission as decimal (e.g. 0.03 = 3%). */
export const PLATFORM_FEE_RATE = 0.03;

export function platformFeeAmount(subtotal: number): number {
  return Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
}
