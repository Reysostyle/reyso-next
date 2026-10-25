"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CHECKOUT_PHONE_KEY, getDefaultAddress, getMockCustomer, setVerified } from "@/lib/customer";
import { toEnglishDigits, toPersianDigits } from "@/lib/digits";
import { useRaw } from "@/lib/local-store";
import { requestOtp, verifyOtp } from "@/lib/otp";
import { syncWishlistWithAccount } from "@/lib/wishlist";
import { useHydrated } from "@/lib/use-hydrated";
import { AuthSteps, hasFullProfile } from "./AuthSteps";

const LENGTH = 5;
const RESEND_SECONDS = 60;

function formatCountdown(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return toPersianDigits(`(${m}:${s})`);
}

export function OtpStep() {
  const router = useRouter();
  const hydrated = useHydrated();
  const phone = useRaw(CHECKOUT_PHONE_KEY);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [countdownKey, setCountdownKey] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // No number to verify: back to step 1.
  useEffect(() => {
    if (hydrated && !phone) router.replace("/checkout/phone");
  }, [hydrated, phone, router]);

  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [countdownKey]);

  async function verify(code: string) {
    if (code.length < LENGTH || verifying || !phone) return;
    setVerifying(true);
    const result = await verifyOtp(phone, code);
    setVerifying(false);

    if (!result.ok) {
      setInvalid(true);
      setError(result.error);
      setDigits(Array(LENGTH).fill(""));
      setTimeout(() => boxes.current[0]?.focus());
      return;
    }

    setVerified(true);
    syncWishlistWithAccount();
    const customer = getMockCustomer(phone);
    router.push(
      hasFullProfile(customer, getDefaultAddress(customer)) ? "/checkout/review" : "/checkout/details",
    );
  }

  function update(next: string[]) {
    setDigits(next);
    setInvalid(false);
    setError("");
    // Verify as soon as every box is filled; the button stays as a fallback.
    if (next.every(Boolean)) verify(next.join(""));
  }

  return (
    <section className="auth-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <Link href="/cart">سبد خرید</Link> / <span>کد تأیید</span>
        </p>
        <div className="auth-card">
          <AuthSteps step={2} />
          <p className="auth-eyebrow">مرحله ۲ از ۴ · کد تأیید</p>
          <h1>کد ۵ رقمی رو وارد کن</h1>
          <p className="auth-sub">
            کد تأیید به شماره‌ی{" "}
            <bdi className="auth-phone-display" id="otp-phone-display" dir="ltr">
              {phone}
            </bdi>{" "}
            پیامک شد.
            <Link href="/checkout/phone" className="auth-edit-phone">
              ویرایش شماره
            </Link>
          </p>
          <form
            className="auth-form"
            id="otp-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              verify(digits.join(""));
            }}
          >
            <fieldset className="auth-otp-boxes" id="otp-boxes" dir="ltr">
              <legend className="sr-only">کد تأیید ۵ رقمی</legend>
              {digits.map((value, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  className={"auth-otp-box" + (invalid ? " is-invalid" : "")}
                  aria-label={`رقم ${toPersianDigits(i + 1)} از ۵`}
                  disabled={verifying}
                  value={value}
                  onChange={(e) => {
                    const d = toEnglishDigits(e.target.value).replace(/\D/g, "").slice(-1);
                    const next = [...digits];
                    next[i] = d;
                    update(next);
                    if (d) boxes.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !value) boxes.current[i - 1]?.focus();
                  }}
                  onPaste={(e) => {
                    const pasted = toEnglishDigits(e.clipboardData.getData("text")).replace(/\D/g, "");
                    if (!pasted) return;
                    e.preventDefault();
                    const next = Array.from({ length: LENGTH }, (_, bi) => pasted[bi] || "");
                    update(next);
                    const firstEmpty = next.findIndex((x) => !x);
                    boxes.current[firstEmpty === -1 ? LENGTH - 1 : firstEmpty]?.focus();
                  }}
                />
              ))}
            </fieldset>
            <p className="auth-error" id="otp-error" hidden={!invalid && !error}>
              {error || "کد وارد‌شده درست نیست. دوباره امتحان کن."}
            </p>
            <button type="submit" className="auth-submit-btn">
              تأیید کد
              <i className="ri-arrow-left-line"></i>
            </button>
            <button
              type="button"
              className="auth-resend-btn"
              id="otp-resend"
              disabled={secondsLeft > 0}
              onClick={async () => {
                setDigits(Array(LENGTH).fill(""));
                setInvalid(false);
                setError("");
                boxes.current[0]?.focus();
                setSecondsLeft(RESEND_SECONDS);
                setCountdownKey((k) => k + 1);
                if (!phone) return;
                const sent = await requestOtp(phone);
                if (!sent.ok) {
                  setError(sent.error);
                  if (sent.retryAfter) setSecondsLeft(sent.retryAfter);
                }
              }}
            >
              ارسال مجدد کد{" "}
              <span id="otp-timer" hidden={secondsLeft <= 0}>
                {formatCountdown(secondsLeft)}
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
