"use client";

import Link from "next/link";
import { useState } from "react";
import { REYSO_CONFIG } from "@/lib/config";
import { useRaw } from "@/lib/local-store";
import { LAST_ORDER_ID_KEY, lookupOrderLocal, lookupOrderRemote } from "@/lib/orders";
import { ORDER_STATUS_STEPS, type TrackLookup, stepStates } from "@/lib/order-status";

type Result = { orderId: string; production: string; trackingCode: string };

export function TrackOrderView() {
  // Pre-filled with the last order placed on this device, if any.
  const lastOrderId = useRaw(LAST_ORDER_ID_KEY) || "";
  const [typed, setOrderId] = useState<string | null>(null);
  const orderId = typed ?? lastOrderId;
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setNotFound(false);
    setResult(null);

    const id = orderId.trim();
    if (!id) return;

    let data: TrackLookup;
    try {
      data = REYSO_CONFIG.TRACK_LOOKUP_URL ? await lookupOrderRemote(id) : lookupOrderLocal(id);
    } catch {
      data = lookupOrderLocal(id);
    }

    if (!data.found || !data.status) {
      setNotFound(true);
      return;
    }
    setResult({
      orderId: id,
      production: data.status.production,
      trackingCode: data.status.trackingCode || "",
    });
  }

  const states = result ? stepStates(result.production) : [];

  return (
    <section className="track-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <span>پیگیری سفارش</span>
        </p>
        <h1 className="cart-title">پیگیری سفارش</h1>
        <p className="track-intro">
          کد سفارشی که بعد از ثبت درخواست دریافت کردی رو وارد کن تا از وضعیت پرداخت و تولید سفارشت باخبر بشی.
        </p>
        <form className="track-form" id="track-form" onSubmit={submit}>
          <input
            type="text"
            id="track-order-id"
            placeholder="مثلاً RS260831-1423"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button type="submit" className="contact-submit-btn">
            پیگیری سفارش
          </button>
        </form>
        <p className="track-not-configured" id="track-not-configured" hidden={submitted}>
          این بخش به‌زودی مستقیم به سیستم سفارش‌ها وصل می‌شه. فعلاً برای پیگیری دقیق‌تر از طریق تلگرام باهامون
          در ارتباط باش.
        </p>
        <p className="track-error" id="track-error" hidden={!notFound}>
          سفارشی با این کد پیدا نشد. لطفاً کد سفارش رو دوباره بررسی کن.
        </p>
        <div className="track-result" id="track-result" hidden={!result}>
          <h3>
            وضعیت سفارش <span id="track-result-id">{result?.orderId}</span>
          </h3>
          <div className="track-timeline" id="track-timeline">
            {result &&
              ORDER_STATUS_STEPS.map((step, i) => (
                <div key={step.key} className={"track-step " + states[i]}>
                  <span className="track-step-dot">
                    <i className="ri-check-line"></i>
                  </span>
                  <span className="track-step-label">{step.label}</span>
                </div>
              ))}
          </div>
          <p className="track-tracking-code" id="track-code-wrap" hidden={!result?.trackingCode}>
            کد رهگیری پستی: <strong id="track-code">{result?.trackingCode}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
