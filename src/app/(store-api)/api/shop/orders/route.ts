import { NextResponse, type NextRequest } from "next/server";
import { createOrder, payOrder, toClientOrder } from "@/lib/server/orders";
import { payloadClient } from "@/lib/server/payload";
import { parseCartLines, quote, QuoteError } from "@/lib/server/pricing";
import { readJson } from "@/lib/server/request";
import { currentCustomer } from "@/lib/server/session";

const text = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// The logged-in customer's orders, newest first.
export async function GET(req: NextRequest) {
  const customer = await currentCustomer(req);
  if (!customer) return NextResponse.json({ error: "وارد نشدی." }, { status: 401 });
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: { customer: { equals: customer.id } },
    sort: "-createdAt",
    limit: 100,
    depth: 0,
  });
  return NextResponse.json({ orders: docs.map(toClientOrder) });
}

// Places an order, priced on the server, and starts the payment.
export async function POST(req: NextRequest) {
  const customer = await currentCustomer(req);
  if (!customer) return NextResponse.json({ error: "برای ثبت سفارش دوباره وارد شو." }, { status: 401 });

  const body = await readJson(req);
  const addr = (body.address ?? {}) as Record<string, unknown>;
  const ship = {
    name: text(body.name, 120),
    province: text(addr.province, 60),
    city: text(addr.city, 60),
    address: text(addr.full, 1000),
    postal: text(addr.postal, 20),
    telegram: text(body.telegram, 60).replace(/^@/, ""),
    notes: text(body.notes, 1000),
  };
  if (!ship.name || !ship.address) {
    return NextResponse.json({ error: "نام و آدرس گیرنده لازمه." }, { status: 400 });
  }

  let priced;
  try {
    priced = await quote(parseCartLines(body.items), text(body.discountCode, 40));
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
  if (priced.discountError) return NextResponse.json({ error: priced.discountError }, { status: 400 });
  // The customer confirmed a total on the review step; if prices changed
  // since, show the new one rather than charging something else.
  if (typeof body.expectedTotal === "number" && body.expectedTotal !== priced.total) {
    return NextResponse.json(
      { error: "قیمت بعضی اقلام تغییر کرده. مبلغ جدید رو بررسی کن و دوباره ثبت کن.", total: priced.total },
      { status: 409 },
    );
  }

  const order = await createOrder(customer, priced, ship);
  if (order.paymentStatus !== "unpaid") return NextResponse.json({ orderId: order.orderNumber });

  const started = await payOrder(order, req.nextUrl.origin);
  // The order exists either way; a failed start can be retried from the profile.
  return NextResponse.json({
    orderId: order.orderNumber,
    payUrl: started.ok ? started.url : null,
    payError: started.ok ? null : started.error,
  });
}
