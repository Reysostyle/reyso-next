import type { CartLine } from "./cart";
import { REYSO_CONFIG } from "./config";
import type { OrderStatus, TrackLookup } from "./order-status";

// With the server running (ACCOUNTS_API), orders are placed, priced and
// paid for on the server (src/app/(store-api)/api/orders). The GitHub
// Pages preview has no server and keeps them in the browser, as the old
// site did.

/** Online payment is on (Zarinpal or the local demo gateway). */
export const ONLINE_PAYMENT = process.env.NEXT_PUBLIC_ONLINE_PAYMENT === "1";

export const PENDING_ORDERS_KEY = "reyso_pending_orders";
export const LAST_ORDER_ID_KEY = "reyso_last_order_id";

export type Order = {
  orderId?: string;
  status?: OrderStatus | "pending_payment" | "cancelled";
  paymentStatus?: "unpaid" | "paid" | "manual";
  refId?: string;
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
 *  2026-08-31. Only used without a server, which issues its own ids. */
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

/** Keeps the order in this browser only (no server: GitHub Pages preview). */
export function submitOrderLocally(order: Order): string {
  const local: Order = { ...order, orderId: generateOrderId(), status: "registered" };
  savePendingOrderLocally(local);
  return local.orderId!;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; data?: T };

async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch("/api/" + path, {
      ...init,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: body as T };
    return {
      ok: false,
      status: res.status,
      error: body.error || "مشکلی پیش اومد. دوباره امتحان کن.",
      data: body,
    };
  } catch {
    return { ok: false, status: 0, error: "اتصال برقرار نشد. اینترنتت رو چک کن و دوباره امتحان کن." };
  }
}

const cartItems = (cart: CartLine[]) => cart.map(({ id, size, color, qty }) => ({ id, size, color, qty }));

export type Quote = {
  lines: { id: string; size: string; color: string; price: number }[];
  subtotal: number;
  discount: { code: string; amount: number; label: string } | null;
  discountError: string | null;
  shippingCost: number;
  total: number;
};

/** Server prices for the cart and an optional discount code. */
export const fetchQuote = (cart: CartLine[], discountCode = "") =>
  api<Quote>("orders/quote", {
    method: "POST",
    body: JSON.stringify({ items: cartItems(cart), discountCode }),
  });

export type PlaceOrderInput = {
  cart: CartLine[];
  name: string;
  address: { province?: string; city?: string; full: string; postal: string };
  telegram: string;
  notes: string;
  discountCode: string;
  expectedTotal: number;
};

export const placeOrder = (input: PlaceOrderInput) =>
  api<{ orderId: string; payUrl?: string | null; payError?: string | null; total?: number }>("orders", {
    method: "POST",
    body: JSON.stringify({ ...input, cart: undefined, items: cartItems(input.cart) }),
  });

export const payOrder = (orderId: string) =>
  api<{ payUrl: string }>(`orders/${encodeURIComponent(orderId)}/pay`, { method: "POST" });

export const fetchMyOrders = () => api<{ orders: Order[] }>("orders");

export function telegramBotLink(phoneDigits?: string): string {
  if (!REYSO_CONFIG.TELEGRAM_BOT_USERNAME) return "https://telegram.org";
  const base = "https://t.me/" + REYSO_CONFIG.TELEGRAM_BOT_USERNAME;
  return phoneDigits ? base + "?start=" + phoneDigits : base;
}

/** Asks the server for an order's current status. Throws when the
 *  request fails so callers can fall back to the local copy. */
export async function lookupOrderRemote(orderId: string): Promise<TrackLookup> {
  const res = await fetch("/api/orders/track/" + encodeURIComponent(orderId));
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
