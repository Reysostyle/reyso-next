import "server-only";
import { randomInt } from "crypto";
import type { Customer, Order } from "@/payload-types";
import { payloadClient } from "./payload";
import { paymentMode, startPayment, verifyPayment } from "./payment";
import type { Quote } from "./pricing";

/** "RS261025-4821": the date plus four random digits, readable aloud. */
async function newOrderNumber(): Promise<string> {
  const payload = await payloadClient();
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const prefix = "RS" + String(d.getFullYear()).slice(-2) + p(d.getMonth() + 1) + p(d.getDate()) + "-";
  for (let i = 0; i < 10; i++) {
    const candidate = prefix + String(randomInt(1000, 10000));
    const { totalDocs } = await payload.count({
      collection: "orders",
      where: { orderNumber: { equals: candidate } },
    });
    if (!totalDocs) return candidate;
  }
  return prefix + String(Date.now()).slice(-6);
}

export type ShippingDetails = {
  name: string;
  province: string;
  city: string;
  address: string;
  postal: string;
  telegram: string;
  notes: string;
};

export async function createOrder(customer: Customer, priced: Quote, ship: ShippingDetails): Promise<Order> {
  const payload = await payloadClient();
  const manual = paymentMode() === "manual";
  const order = await payload.create({
    collection: "orders",
    data: {
      orderNumber: await newOrderNumber(),
      // Without online payment the order is placed straight away and paid
      // for by arrangement, like on the old site.
      status: manual ? "registered" : "pending_payment",
      paymentStatus: manual ? "manual" : "unpaid",
      customer: customer.id,
      customerName: ship.name,
      phone: customer.phone,
      province: ship.province,
      city: ship.city,
      postal: ship.postal,
      address: ship.address,
      telegram: ship.telegram,
      notes: ship.notes,
      shipping: "post",
      items: priced.lines,
      subtotal: priced.subtotal,
      discountCode: priced.discount?.code ?? "",
      discountAmount: priced.discount?.amount ?? 0,
      shippingCost: priced.shippingCost,
      total: priced.total,
    },
  });
  if (manual) await countDiscountUse(order);
  return order;
}

async function countDiscountUse(order: Order) {
  if (!order.discountCode) return;
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "discount-codes",
    where: { code: { equals: order.discountCode } },
    limit: 1,
    depth: 0,
  });
  if (docs[0]) {
    await payload.update({
      collection: "discount-codes",
      id: docs[0].id,
      data: { usedCount: (docs[0].usedCount ?? 0) + 1 },
    });
  }
}

const siteUrl = (fallback: string) => (process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, "");

/** Sends the customer to the bank for an unpaid order. */
export async function payOrder(order: Order, origin: string) {
  const payload = await payloadClient();
  const started = await startPayment({
    orderNumber: order.orderNumber,
    amount: order.total,
    phone: order.phone,
    callbackUrl: `${siteUrl(origin)}/api/payment/callback?order=${encodeURIComponent(order.orderNumber)}`,
  });
  if (!started.ok) return started;
  await payload.update({
    collection: "orders",
    id: order.id,
    data: { payment: { gateway: paymentMode(), authority: started.authority } },
  });
  return started;
}

/** Handles the customer's return from the bank. Only the gateway's verify
 *  call can mark an order paid; the query string alone proves nothing. */
export async function completePayment(orderNumber: string, authority: string, gatewaySaysOk: boolean) {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    depth: 0,
  });
  const order = docs[0];
  if (!order) return { ok: false as const, order: null };
  if (order.paymentStatus === "paid") return { ok: true as const, order };
  if (!gatewaySaysOk || !authority || order.payment?.authority !== authority)
    return { ok: false as const, order };

  const verified = await verifyPayment({ authority, amount: order.total });
  if (!verified.ok) return { ok: false as const, order };

  const paid = await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      status: order.status === "pending_payment" ? "registered" : order.status,
      paymentStatus: "paid",
      payment: {
        ...order.payment,
        refId: verified.refId,
        cardPan: verified.cardPan,
        paidAt: new Date().toISOString(),
      },
    },
  });
  await countDiscountUse(paid);
  return { ok: true as const, order: paid };
}

/** The shape the storefront's profile page shows (src/lib/orders.ts). */
export function toClientOrder(o: Order) {
  return {
    orderId: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    refId: o.payment?.refId ?? "",
    trackingCode: o.trackingCode ?? "",
    createdAt: o.createdAt,
    customer: {
      name: o.customerName,
      phone: o.phone,
      telegram: o.telegram ?? "",
      address: o.address,
      shipping: o.shipping ?? "post",
    },
    items: (o.items ?? []).map((i) => ({
      id: i.productSlug,
      name: i.name,
      price: i.unitPrice,
      image: i.image ?? "",
      size: i.size,
      color: i.color,
      qty: i.qty,
    })),
    subtotal: o.subtotal,
    shippingCost: o.shippingCost ?? 0,
    discountCode: o.discountCode ?? "",
    discountAmount: o.discountAmount ?? 0,
    total: o.total,
    notes: o.notes ?? "",
  };
}
