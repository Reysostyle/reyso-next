// Placeholder discount codes. These are visible to anyone reading the
// site's JavaScript, so they must move server-side with the order API.
const DISCOUNT_CODES: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
  REYSO10: { type: "percent", value: 10, label: "۱۰٪ تخفیف" },
  WELCOME50: { type: "fixed", value: 50000, label: "۵۰٬۰۰۰ تومان تخفیف" },
};

export type AppliedDiscount = { code: string; amount: number; label: string };

/** Looks a code up (case/whitespace-insensitive). Percent codes round to
 *  the nearest 1,000 toman; the amount never exceeds the subtotal. */
export function resolveDiscountCode(rawCode: string, subtotal: number): AppliedDiscount | null {
  const code = rawCode.trim().toUpperCase();
  const entry = code ? DISCOUNT_CODES[code] : undefined;
  if (!entry) return null;
  const raw =
    entry.type === "percent" ? Math.round((subtotal * entry.value) / 100 / 1000) * 1000 : entry.value;
  return { code, amount: Math.min(raw, subtotal), label: entry.label };
}
