import { NextResponse, type NextRequest } from "next/server";
import { parseCartLines, quote, QuoteError } from "@/lib/server/pricing";
import { readJson } from "@/lib/server/request";

// Prices the cart (and a discount code) from the catalogue, for the review step.
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  try {
    const q = await quote(
      parseCartLines(body.items),
      typeof body.discountCode === "string" ? body.discountCode : "",
    );
    return NextResponse.json({
      lines: q.lines.map((l) => ({ id: l.productSlug, size: l.size, color: l.color, price: l.unitPrice })),
      subtotal: q.subtotal,
      discount: q.discount && { code: q.discount.code, amount: q.discount.amount, label: q.discount.label },
      discountError: q.discountError,
      shippingCost: q.shippingCost,
      total: q.total,
    });
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
