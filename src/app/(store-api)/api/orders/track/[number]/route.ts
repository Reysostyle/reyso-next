import { NextResponse, type NextRequest } from "next/server";
import { payloadClient } from "@/lib/server/payload";

// Public order tracking by order number: only the production status and
// the postal tracking code, nothing personal.
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/track/[number]">) {
  const { number } = await ctx.params;
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: number.trim().toUpperCase() } },
    limit: 1,
    depth: 0,
  });
  const order = docs[0];
  if (!order || order.status === "pending_payment" || order.status === "cancelled") {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({
    found: true,
    status: { production: order.status, trackingCode: order.trackingCode ?? "" },
  });
}
