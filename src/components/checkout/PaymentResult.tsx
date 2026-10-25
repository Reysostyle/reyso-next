"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toPersianDigits } from "@/lib/digits";
import { payOrder } from "@/lib/orders";

// Where the customer lands after the bank (src/app/(store-api)/api/payment/callback).
export function PaymentResult() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const ok = params.get("status") === "ok";
  const ref = params.get("ref") ?? "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <section className="profile-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <span>نتیجه پرداخت</span>
        </p>
        {ok ? (
          <div className="profile-guest">
            <i className="ri-checkbox-circle-line"></i>
            <h1>پرداخت با موفقیت انجام شد</h1>
            <p>سفارشت ثبت شد و به‌زودی دوختش شروع می‌شه. وضعیتش رو از پروفایلت دنبال کن.</p>
            <p className="pay-result-meta">
              کد سفارش: <bdi dir="ltr">{orderId}</bdi>
              {ref && (
                <>
                  {" "}
                  · کد پیگیری بانک: <bdi dir="ltr">{toPersianDigits(ref)}</bdi>
                </>
              )}
            </p>
            <Link href={"/profile?new_order=" + encodeURIComponent(orderId)} className="profile-guest-btn">
              مشاهده سفارش
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
        ) : (
          <div className="profile-guest is-failed">
            <i className="ri-close-circle-line"></i>
            <h1>پرداخت انجام نشد</h1>
            <p>
              سفارشت ذخیره شده ولی هنوز پرداخت نشده. اگه مبلغی از حسابت کم شده، تا ۷۲ ساعت خودکار برمی‌گرده.
            </p>
            {orderId && (
              <p className="pay-result-meta">
                کد سفارش: <bdi dir="ltr">{orderId}</bdi>
              </p>
            )}
            <div className="pay-result-actions">
              {orderId && (
                <button
                  type="button"
                  className="profile-guest-btn"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    const res = await payOrder(orderId);
                    if (res.ok) return window.location.assign(res.data.payUrl);
                    setBusy(false);
                    setError(res.error);
                  }}
                >
                  {busy ? "در حال اتصال به درگاه..." : "پرداخت دوباره"}
                  <i className="ri-arrow-left-line"></i>
                </button>
              )}
              <Link href="/profile" className="pay-result-link">
                سفارش‌های من
              </Link>
            </div>
            {error && <p className="auth-error">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
