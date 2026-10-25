import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload } from "payload";
import { formatToman } from "@/lib/format";
import { kavenegarLookup } from "@/lib/server/kavenegar";
import type { Order } from "@/payload-types";

type Status = Order["status"];

/** Keeps a dated list of the statuses an order went through, for the
 *  tracking page. */
export const recordStatusHistory: CollectionBeforeChangeHook<Order> = ({ data, originalDoc }) => {
  const status = data.status ?? originalDoc?.status;
  if (!status || status === originalDoc?.status) return data;
  const history = data.statusHistory ?? originalDoc?.statusHistory ?? [];
  return { ...data, statusHistory: [...history, { status, at: new Date().toISOString() }] };
};

/** Tells the customer (SMS) when their order moves on, and the shop
 *  (Telegram) when a new order comes in. Runs after the response so a slow
 *  SMS panel never holds up checkout or the admin panel. */
export const notifyOrderChange: CollectionAfterChangeHook<Order> = ({ doc, previousDoc, operation, req }) => {
  const before: Status | undefined = operation === "create" ? undefined : previousDoc?.status;
  const statusChanged = doc.status !== before;
  const codeAdded = !!doc.trackingCode && doc.trackingCode !== (previousDoc?.trackingCode ?? "");

  const jobs: Array<() => Promise<void>> = [];
  if (statusChanged && doc.status !== "pending_payment") {
    jobs.push(() => sendCustomerSms(req.payload, doc, statusText(doc)));
  } else if (codeAdded && doc.status === "shipped") {
    jobs.push(() => sendCustomerSms(req.payload, doc, statusText(doc)));
  }
  if (statusChanged && doc.status === "registered" && (!before || before === "pending_payment")) {
    jobs.push(() => sendShopTelegram(req.payload, doc));
  }
  if (jobs.length) {
    setTimeout(() => {
      (async () => {
        for (const job of jobs) await job();
      })().catch((err) => req.payload.logger.error({ err, msg: "order notification failed" }));
    }, 0);
  }
  return doc;
};

/** The part of the SMS after "سفارش RS...:" — Kavenegar's token20, which
 *  allows at most 8 spaces. */
export function statusText(order: Pick<Order, "status" | "trackingCode">): string {
  switch (order.status) {
    case "registered":
      return "ثبت شد. ممنون از خریدتون";
    case "sewing":
      return "در حال دوخت است";
    case "ready":
      return "دوخته شد و آماده ارسال است";
    case "shipped":
      return order.trackingCode ? `ارسال شد. کد رهگیری پست: ${order.trackingCode}` : "ارسال شد";
    case "cancelled":
      return "لغو شد";
    default:
      return "";
  }
}

async function sendCustomerSms(payload: Payload, order: Order, text: string) {
  const template = process.env.KAVENEGAR_ORDER_TEMPLATE;
  const configured = !!(process.env.KAVENEGAR_API_KEY && template);
  const res = configured
    ? await kavenegarLookup(order.phone, template!, { token: order.orderNumber, token20: text })
    : null;
  await log(payload, order, {
    channel: "sms",
    to: order.phone,
    text: `سفارش ${order.orderNumber}: ${text}`,
    result: !res ? "not_configured" : res.ok ? "sent" : "failed",
    error: res?.error,
  });
}

async function sendShopTelegram(payload: Payload, order: Order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = newOrderMessage(order);
  let result: "sent" | "failed" | "not_configured" = "not_configured";
  let error: string | undefined;
  if (token && chatId) {
    // Telegram is filtered on Iranian servers; Bale's bot API is a drop-in
    // replacement (TELEGRAM_API_BASE=https://tapi.bale.ai).
    const base = (process.env.TELEGRAM_API_BASE || "https://api.telegram.org").replace(/\/$/, "");
    try {
      const res = await fetch(`${base}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(10_000),
      });
      result = res.ok ? "sent" : "failed";
      if (!res.ok) error = `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
    } catch (err) {
      result = "failed";
      error = String(err).slice(0, 300);
    }
  }
  await log(payload, order, { channel: "telegram", to: chatId ?? "", text, result, error });
}

export function newOrderMessage(order: Order): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const paid = order.paymentStatus === "paid" ? "پرداخت شده" : "پرداخت با هماهنگی";
  const lines = [
    `🛍 سفارش جدید ${order.orderNumber}`,
    `${order.customerName} · ${order.phone}`,
    [order.province, order.city].filter(Boolean).join("، "),
    "",
    ...(order.items ?? []).map((i) => `• ${i.name} (سایز ${i.size}، ${i.color}) ×${i.qty}`),
    "",
    `مبلغ: ${formatToman(order.total)} (${paid})`,
  ];
  if (order.notes) lines.push(`یادداشت: ${order.notes}`);
  if (site) lines.push("", `${site}/admin/collections/orders/${order.id}`);
  return lines.filter((l, i, all) => l || all[i - 1]).join("\n");
}

async function log(
  payload: Payload,
  order: Order,
  data: {
    channel: "sms" | "telegram";
    to: string;
    text: string;
    result: "sent" | "failed" | "not_configured";
    error?: string;
  },
) {
  await payload.create({ collection: "notifications", data: { order: order.id, ...data } });
}
