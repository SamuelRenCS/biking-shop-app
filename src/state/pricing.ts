import type { Product } from "@/data/products";

import type { CartLine } from "./cart";

/**
 * Cart pricing rules. Not in the design, so these are our choices (also listed in the README):
 * - Delivery is free when the merchandise subtotal (before discounts) reaches $500, so any bike
 *   order ships free. Smaller orders (accessories only) pay a flat $15.
 * - Promo codes are case-insensitive. "BIKE30" takes 30% off the subtotal, not the delivery fee.
 * All maths is in whole cents so totals never drift.
 */
export const FREE_SHIPPING_THRESHOLD = 500;
export const DELIVERY_FEE = 15;
const PROMO_RATES: Record<string, number> = { BIKE30: 0.3 };

export const normalizePromo = (code: string) => code.trim().toUpperCase();
export const isValidPromo = (code: string) => normalizePromo(code) in PROMO_RATES;

export type CartTotals = {
  subtotal: number;
  delivery: number;
  discountRate: number;
  discount: number;
  total: number;
  qualifiesForFreeShipping: boolean;
  /** How much more the subtotal needs to reach free shipping (0 once it qualifies). */
  toFreeShipping: number;
};

export function cartTotals(
  lines: CartLine[],
  catalog: Record<string, Product>,
  promoCode: string | null,
): CartTotals {
  const cents = (dollars: number) => Math.round(dollars * 100);
  const subtotal = lines.reduce((sum, l) => sum + cents(catalog[l.productId].price) * l.quantity, 0);
  const qualifies = subtotal >= cents(FREE_SHIPPING_THRESHOLD);
  const delivery = lines.length === 0 || qualifies ? 0 : cents(DELIVERY_FEE);
  const discountRate = promoCode ? (PROMO_RATES[normalizePromo(promoCode)] ?? 0) : 0;
  const discount = Math.round(subtotal * discountRate);

  return {
    subtotal: subtotal / 100,
    delivery: delivery / 100,
    discountRate,
    discount: discount / 100,
    total: (subtotal - discount + delivery) / 100,
    qualifiesForFreeShipping: qualifies,
    toFreeShipping: Math.max(0, cents(FREE_SHIPPING_THRESHOLD) - subtotal) / 100,
  };
}
