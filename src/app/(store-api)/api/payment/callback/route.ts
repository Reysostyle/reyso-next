import { NextResponse, type NextRequest } from "next/server";
import { completePayment } from "@/lib/server/orders";

// Where the bank sends the customer back (Zarinpal adds Authority and
// Status=OK|NOK). Verifies the payment, then shows the result page.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const orderNumber = q.get("order") ?? "";
  const result = await completePayment(orderNumber, q.get("Authority") ?? "", q.get("Status") === "OK");
  const params = new URLSearchParams({ order: orderNumber, status: result.ok ? "ok" : "failed" });
  if (result.ok && result.order?.payment?.refId) params.set("ref", result.order.payment.refId);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.redirect(`${base}/checkout/result?${params}`, 303);
}
