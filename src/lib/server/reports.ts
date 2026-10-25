import "server-only";
import type { Payload } from "payload";
import type { Order } from "@/payload-types";

// Sales figures for the admin dashboard, computed from the orders table.
// A small shop has few enough orders to add them up here; a reporting
// table can come later if that changes.

const TZ = "Asia/Tehran";
const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabel = new Intl.DateTimeFormat("fa-IR", { timeZone: TZ, month: "short", day: "numeric" });

export type Ranked = { label: string; value: number }[];

export type SalesReport = {
  days: number;
  revenue: number;
  orders: number;
  averageOrder: number;
  todayRevenue: number;
  todayOrders: number;
  toHandle: number;
  awaitingPayment: number;
  daily: { key: string; label: string; revenue: number; orders: number }[];
  topProducts: Ranked;
  sizes: Ranked;
  colors: Ranked;
  cities: Ranked;
  discounts: { code: string; orders: number; amount: number }[];
  newCustomers: number;
  returningCustomers: number;
};

function rank(map: Map<string, number>, limit: number): Ranked {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

const add = (map: Map<string, number>, key: string, by: number) => map.set(key, (map.get(key) ?? 0) + by);

type OrderDoc = Pick<
  Order,
  | "id"
  | "customer"
  | "phone"
  | "createdAt"
  | "total"
  | "items"
  | "city"
  | "province"
  | "discountCode"
  | "discountAmount"
>;

export async function salesReport(payload: Payload, days: number): Promise<SalesReport> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  // Placed orders: paid online, or placed for payment by arrangement.
  const placed = { paymentStatus: { in: ["paid", "manual"] }, status: { not_equals: "cancelled" } };

  const [{ docs }, toHandle, awaitingPayment] = await Promise.all([
    payload.find({
      collection: "orders",
      where: { and: [placed, { createdAt: { greater_than_equal: since.toISOString() } }] },
      pagination: false,
      depth: 0,
      sort: "createdAt",
    }),
    payload.count({ collection: "orders", where: { status: { in: ["registered", "sewing", "ready"] } } }),
    payload.count({
      collection: "orders",
      where: {
        status: { equals: "pending_payment" },
        createdAt: { greater_than_equal: since.toISOString() },
      },
    }),
  ]);
  const orders = docs as OrderDoc[];

  const today = dayKey.format(new Date());
  const daily = new Map<string, { label: string; revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    daily.set(dayKey.format(d), { label: dayLabel.format(d), revenue: 0, orders: 0 });
  }

  const products = new Map<string, number>();
  const sizes = new Map<string, number>();
  const colors = new Map<string, number>();
  const cities = new Map<string, number>();
  const discounts = new Map<string, { orders: number; amount: number }>();
  const buyers = new Set<string>();
  let revenue = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  for (const o of orders) {
    revenue += o.total;
    const key = dayKey.format(new Date(o.createdAt));
    const bucket = daily.get(key);
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
    if (key === today) {
      todayRevenue += o.total;
      todayOrders += 1;
    }
    for (const item of o.items ?? []) {
      add(products, item.name, item.qty);
      add(sizes, item.size, item.qty);
      add(colors, item.color, item.qty);
    }
    add(cities, o.city || o.province || "نامشخص", 1);
    if (o.discountCode) {
      const d = discounts.get(o.discountCode) ?? { orders: 0, amount: 0 };
      d.orders += 1;
      d.amount += o.discountAmount ?? 0;
      discounts.set(o.discountCode, d);
    }
    buyers.add(o.phone);
  }

  // A buyer is returning if they had a placed order before this period.
  let returningCustomers = 0;
  if (buyers.size) {
    const earlier = await payload.find({
      collection: "orders",
      where: {
        and: [placed, { phone: { in: [...buyers] } }, { createdAt: { less_than: since.toISOString() } }],
      },
      pagination: false,
      depth: 0,
      select: { phone: true },
    });
    returningCustomers = new Set(earlier.docs.map((o) => o.phone)).size;
  }

  return {
    days,
    revenue,
    orders: orders.length,
    averageOrder: orders.length ? Math.round(revenue / orders.length) : 0,
    todayRevenue,
    todayOrders,
    toHandle: toHandle.totalDocs,
    awaitingPayment: awaitingPayment.totalDocs,
    daily: [...daily.entries()].map(([k, v]) => ({ key: k, ...v })),
    topProducts: rank(products, 5),
    sizes: rank(sizes, 8),
    colors: rank(colors, 5),
    cities: rank(cities, 5),
    discounts: [...discounts.entries()]
      .map(([code, d]) => ({ code, ...d }))
      .sort((a, b) => b.orders - a.orders),
    newCustomers: buyers.size - returningCustomers,
    returningCustomers,
  };
}
