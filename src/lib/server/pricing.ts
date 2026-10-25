import "server-only";
import type { DiscountCode, Product } from "@/payload-types";
import { payloadClient } from "./payload";

// Prices an order from the catalogue in the database. The cart in the
// browser only says which products, sizes, colours and how many; its
// prices are display copies and never trusted.

export type CartRequestLine = { id: string; size: string; color: string; qty: number };

export type PricedLine = {
  product: number;
  productSlug: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
  image: string;
};

export type Quote = {
  lines: PricedLine[];
  subtotal: number;
  discount: { code: string; amount: number; label: string; id: number } | null;
  discountError: string | null;
  shippingCost: number;
  total: number;
};

export class QuoteError extends Error {}

const MAX_LINES = 30;
const MAX_QTY = 20;
// Shipping is free today, as on the old site.
const SHIPPING_COST = 0;

export function parseCartLines(raw: unknown): CartRequestLine[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new QuoteError("سبد خرید خالیه.");
  if (raw.length > MAX_LINES) throw new QuoteError("تعداد اقلام سبد زیاده.");
  return raw.map((l) => {
    const line = (l ?? {}) as Record<string, unknown>;
    const qty = Number(line.qty);
    if (
      typeof line.id !== "string" ||
      typeof line.size !== "string" ||
      typeof line.color !== "string" ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > MAX_QTY
    ) {
      throw new QuoteError("یکی از اقلام سبد خرید نامعتبره.");
    }
    return { id: line.id, size: line.size, color: line.color, qty };
  });
}

const firstImage = (p: Product) => {
  const img = p.images?.[0];
  return typeof img === "object" && img ? (img.url ?? "") : "";
};

/** Percent codes round to the nearest 1,000 toman; never more than the subtotal. */
function discountAmount(code: DiscountCode, subtotal: number): number {
  const raw = code.type === "percent" ? Math.round((subtotal * code.value) / 100 / 1000) * 1000 : code.value;
  return Math.min(raw, subtotal);
}

export async function findDiscount(
  rawCode: string,
  subtotal: number,
): Promise<{ code: DiscountCode } | { error: string }> {
  const payload = await payloadClient();
  const code = rawCode.trim().toUpperCase();
  const { docs } = await payload.find({
    collection: "discount-codes",
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
  });
  const found = docs[0];
  if (!found || !found.active) return { error: "این کد تخفیف معتبر نیست." };
  if (found.expiresAt && Date.parse(found.expiresAt) < Date.now())
    return { error: "مهلت این کد تخفیف تموم شده." };
  if (found.maxUses && (found.usedCount ?? 0) >= found.maxUses)
    return { error: "ظرفیت این کد تخفیف پر شده." };
  if (found.minSubtotal && subtotal < found.minSubtotal) {
    return { error: `این کد برای خریدهای بالای ${found.minSubtotal.toLocaleString("fa-IR")} تومانه.` };
  }
  return { code: found };
}

export async function quote(lines: CartRequestLine[], discountCode?: string): Promise<Quote> {
  const payload = await payloadClient();
  const slugs = [...new Set(lines.map((l) => l.id))];
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { in: slugs }, published: { equals: true } },
    limit: slugs.length,
    depth: 1,
    pagination: false,
  });
  const bySlug = new Map(docs.map((p) => [p.slug, p]));

  const priced = lines.map((line): PricedLine => {
    const p = bySlug.get(line.id);
    if (!p) throw new QuoteError("یکی از محصولات سبد دیگه موجود نیست. سبد رو بررسی کن.");
    if (!p.sizes.includes(line.size as never) || (p.soldOutSizes ?? []).includes(line.size as never)) {
      throw new QuoteError(`سایز ${line.size} «${p.name}» موجود نیست.`);
    }
    if (!p.colors.some((c) => c.name === line.color)) {
      throw new QuoteError(`رنگ انتخاب‌شده برای «${p.name}» موجود نیست.`);
    }
    return {
      product: p.id,
      productSlug: p.slug,
      name: p.name,
      size: line.size,
      color: line.color,
      qty: line.qty,
      unitPrice: p.price,
      image: firstImage(p),
    };
  });

  const subtotal = priced.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  let discount: Quote["discount"] = null;
  let discountError: string | null = null;
  if (discountCode?.trim()) {
    const found = await findDiscount(discountCode, subtotal);
    if ("error" in found) discountError = found.error;
    else
      discount = {
        id: found.code.id,
        code: found.code.code,
        label: found.code.label,
        amount: discountAmount(found.code, subtotal),
      };
  }
  const total = Math.max(0, subtotal - (discount?.amount ?? 0) + SHIPPING_COST);
  return { lines: priced, subtotal, discount, discountError, shippingCost: SHIPPING_COST, total };
}
