import type { CartLine } from "./cart";
import { REYSO_CONFIG } from "./config";
import type { OrderStatus, TrackLookup } from "./order-status";

export const PENDING_ORDERS_KEY = "reyso_pending_orders";
export const LAST_ORDER_ID_KEY = "reyso_last_order_id";

export type Order = {
  orderId?: string;
  status?: OrderStatus;
  trackingCode?: string;
  createdAt: string;
  customer: { name: string; phone: string; telegram: string; address: string; shipping: string };
  items: CartLine[];
  subtotal: number;
  shippingCost: number;
  discountCode: string;
  discountAmount: number;
  total: number;
  notes: string;
};

/** Date+time based and readable aloud: "RS260831-1423" = 14:23 on
 *  2026-08-31. Two orders in the same minute would collide; acceptable
 *  for now, the order backend should issue ids instead. */
export function generateOrderId(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    "RS" +
    String(now.getFullYear()).slice(-2) +
    p(now.getMonth() + 1) +
    p(now.getDate()) +
    "-" +
    p(now.getHours()) +
    p(now.getMinutes())
  );
}

export function getPendingOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePendingOrderLocally(order: Order) {
  try {
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify([...getPendingOrders(), order]));
  } catch {
    // nothing to persist to
  }
}

export function getCustomerOrders(phone: string): Order[] {
  return getPendingOrders()
    .filter((o) => o.customer?.phone === phone)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export type SubmitResult = { ok: true; orderId: string } | { ok: false };

/**
 * Sends the order to ORDER_API_URL. With no URL configured (demo mode)
 * the order is only kept in this browser, as on the old site. When a
 * URL is configured and the request fails, the order is NOT reported as
 * placed: the old site saved it locally and told the customer it was
 * registered, so the shop never saw it.
 */
export async function submitOrder(order: Order): Promise<SubmitResult> {
  const local: Order = { ...order, orderId: generateOrderId(), status: "registered" };

  if (!REYSO_CONFIG.ORDER_API_URL) {
    savePendingOrderLocally(local);
    return { ok: true, orderId: local.orderId! };
  }

  try {
    const res = await fetch(REYSO_CONFIG.ORDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    });
    if (!res.ok) throw new Error("bad status " + res.status);
    const data = await res.json().catch(() => ({}));
    const orderId: string = data.orderId || local.orderId!;
    // Kept locally too so the profile page can list it.
    savePendingOrderLocally({ ...local, orderId });
    return { ok: true, orderId };
  } catch {
    return { ok: false };
  }
}

export function telegramBotLink(phoneDigits?: string): string {
  if (!REYSO_CONFIG.TELEGRAM_BOT_USERNAME) return "https://telegram.org";
  const base = "https://t.me/" + REYSO_CONFIG.TELEGRAM_BOT_USERNAME;
  return phoneDigits ? base + "?start=" + phoneDigits : base;
}

/** Asks TRACK_LOOKUP_URL for an order's current status. Throws when the
 *  request fails so callers can fall back to the local copy. */
export async function lookupOrderRemote(orderId: string): Promise<TrackLookup> {
  const res = await fetch(REYSO_CONFIG.TRACK_LOOKUP_URL + "/" + encodeURIComponent(orderId));
  if (!res.ok) throw new Error("bad status " + res.status);
  return res.json();
}

/** Looks the order up in this browser's own order log. */
export function lookupOrderLocal(orderId: string): TrackLookup {
  const order = getPendingOrders().find((o) => o.orderId === orderId);
  if (!order) return { found: false };
  return {
    found: true,
    status: { production: order.status || "registered", trackingCode: order.trackingCode || "" },
  };
}
