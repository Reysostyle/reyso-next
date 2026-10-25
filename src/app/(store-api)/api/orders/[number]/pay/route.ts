import { NextResponse, type NextRequest } from "next/server";
import { payOrder } from "@/lib/server/orders";
import { payloadClient } from "@/lib/server/payload";
import { currentCustomer } from "@/lib/server/session";

// Retries the payment of one of the customer's unpaid orders.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/orders/[number]/pay">) {
  const customer = await currentCustomer(req);
  if (!customer) return NextResponse.json({ error: "وارد نشدی." }, { status: 401 });
  const { number } = await ctx.params;
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: number }, customer: { equals: customer.id } },
    limit: 1,
    depth: 0,
  });
  const order = docs[0];
  if (!order) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
  if (order.paymentStatus !== "unpaid" || order.status !== "pending_payment") {
    return NextResponse.json({ error: "این سفارش نیازی به پرداخت نداره." }, { status: 400 });
  }
  const started = await payOrder(order, req.nextUrl.origin);
  if (!started.ok) return NextResponse.json({ error: started.error }, { status: 502 });
  return NextResponse.json({ payUrl: started.url });
}
