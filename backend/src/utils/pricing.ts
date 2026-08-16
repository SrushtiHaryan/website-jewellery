/**
 * Central pricing rules for the store. Kept in one place so the cart preview
 * and the authoritative checkout calculation can never drift apart.
 *
 * All amounts are in whole rupees (INR).
 */

export const FREE_SHIPPING_THRESHOLD = 2000;
export const FLAT_SHIPPING_FEE = 99;
export const GST_RATE = 0.03; // 3% GST on jewellery

export interface PricingLine {
  price: number; // list price (MRP)
  discountPercent: number;
  quantity: number;
}

export interface PricingResult {
  subtotal: number; // sum of list price * qty
  discount: number; // total savings from discountPercent
  shipping: number;
  tax: number;
  total: number;
}

export function calculatePricing(lines: PricingLine[]): PricingResult {
  let subtotal = 0;
  let discount = 0;

  for (const line of lines) {
    const lineList = Math.round(line.price) * line.quantity;
    const finalUnit = Math.round(line.price * (1 - line.discountPercent / 100));
    const lineFinal = finalUnit * line.quantity;
    subtotal += lineList;
    discount += lineList - lineFinal;
  }

  const taxable = subtotal - discount;
  const shipping = taxable > 0 && taxable < FREE_SHIPPING_THRESHOLD ? FLAT_SHIPPING_FEE : 0;
  const tax = Math.round(taxable * GST_RATE);
  const total = taxable + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}
