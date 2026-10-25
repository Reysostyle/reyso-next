"use client";

import { useSearchParams } from "next/navigation";
import { formatToman } from "@/lib/products";

// Stand-in for the bank's page when PAYMENT_DEMO=1: no money moves. It
// returns to the same callback Zarinpal would, with Status=OK or NOK.
export function DemoGateway() {
  const params = useSearchParams();
  const order = params.get("order") ?? "";
  const authority = params.get("authority") ?? "";
  const amount = Number(params.get("amount") ?? 0);
  const back = (status: "OK" | "NOK") =>
    "/api/payment/callback?" + new URLSearchParams({ order, Authority: authority, Status: status });

  return (
    <section className="profile-section">
      <div className="container">
        <div className="profile-guest">
          <i className="ri-bank-card-line"></i>
          <h1>درگاه پرداخت آزمایشی</h1>
          <p>این صفحه جای درگاه بانک رو می‌گیره تا خرید رو بدون پول واقعی امتحان کنید.</p>
          <p className="pay-result-meta">
            سفارش <bdi dir="ltr">{order}</bdi> · مبلغ <bdi>{formatToman(amount)}</bdi>
          </p>
          <div className="pay-result-actions">
            <a href={back("OK")} className="profile-guest-btn" id="demo-pay-ok">
              پرداخت موفق
            </a>
            <a href={back("NOK")} className="pay-result-link" id="demo-pay-cancel">
              انصراف از پرداخت
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
