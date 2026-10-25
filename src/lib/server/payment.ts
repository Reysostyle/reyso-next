import "server-only";

// Online payment. Which gateway is used depends on the environment:
// - "zarinpal": ZARINPAL_MERCHANT_ID is set (ZARINPAL_SANDBOX=1 for
//   Zarinpal's test gateway, where no real money moves);
// - "demo": PAYMENT_DEMO=1, a fake bank page on this site for trying the
//   checkout locally;
// - "manual": neither; orders are placed unpaid and payment is arranged
//   with the customer, as on the old site.
export type PaymentMode = "zarinpal" | "demo" | "manual";

export function paymentMode(): PaymentMode {
  if (process.env.ZARINPAL_MERCHANT_ID) return "zarinpal";
  if (process.env.PAYMENT_DEMO === "1") return "demo";
  return "manual";
}

const sandbox = () => process.env.ZARINPAL_SANDBOX === "1";
const zarinpalApi = () =>
  process.env.ZARINPAL_API_BASE ||
  (sandbox() ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com");
const zarinpalStartPay = (authority: string) =>
  `${sandbox() ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com"}/pg/StartPay/${authority}`;

// Zarinpal amounts are in rials; the shop's prices are in toman.
const rials = (toman: number) => toman * 10;

export type StartResult = { ok: true; authority: string; url: string } | { ok: false; error: string };

export async function startPayment(opts: {
  orderNumber: string;
  amount: number;
  phone: string;
  callbackUrl: string;
}): Promise<StartResult> {
  const mode = paymentMode();
  if (mode === "demo") {
    const authority = `DEMO-${opts.orderNumber}-${Date.now()}`;
    const params = new URLSearchParams({ order: opts.orderNumber, authority, amount: String(opts.amount) });
    return { ok: true, authority, url: `/checkout/pay-demo?${params}` };
  }
  if (mode !== "zarinpal") return { ok: false, error: "پرداخت آنلاین فعال نیست." };

  try {
    const res = await fetch(`${zarinpalApi()}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: rials(opts.amount),
        callback_url: opts.callbackUrl,
        description: `سفارش ${opts.orderNumber} - ReySo`,
        metadata: { mobile: opts.phone, order_id: opts.orderNumber },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json().catch(() => ({}));
    const authority = body?.data?.authority;
    if (body?.data?.code === 100 && authority)
      return { ok: true, authority, url: zarinpalStartPay(authority) };
    console.error("Zarinpal request failed", res.status, JSON.stringify(body?.errors ?? body));
  } catch (err) {
    console.error("Zarinpal request error", err);
  }
  return { ok: false, error: "اتصال به درگاه پرداخت انجام نشد. چند لحظه دیگه دوباره امتحان کن." };
}

export type VerifyResult = { ok: true; refId: string; cardPan: string } | { ok: false };

/** Confirms with the gateway that the amount was really paid. */
export async function verifyPayment(opts: { authority: string; amount: number }): Promise<VerifyResult> {
  const mode = paymentMode();
  if (mode === "demo") {
    return opts.authority.startsWith("DEMO-")
      ? { ok: true, refId: `DEMO${Date.now()}`, cardPan: "" }
      : { ok: false };
  }
  if (mode !== "zarinpal") return { ok: false };
  try {
    const res = await fetch(`${zarinpalApi()}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: rials(opts.amount),
        authority: opts.authority,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json().catch(() => ({}));
    // 100 = verified now, 101 = already verified earlier (e.g. a reload).
    if (body?.data?.code === 100 || body?.data?.code === 101) {
      return { ok: true, refId: String(body.data.ref_id ?? ""), cardPan: String(body.data.card_pan ?? "") };
    }
    console.error("Zarinpal verify failed", res.status, JSON.stringify(body?.errors ?? body));
  } catch (err) {
    console.error("Zarinpal verify error", err);
  }
  return { ok: false };
}
