"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getLoggedInPhone, setCheckoutPhone, setVerified } from "@/lib/customer";
import { toEnglishDigits } from "@/lib/digits";
import { requestOtp } from "@/lib/otp";
import { AuthSteps } from "./AuthSteps";

const IRAN_MOBILE_PATTERN = /^09\d{9}$/;

export function PhoneStep() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = phone.trim();
    const valid = IRAN_MOBILE_PATTERN.test(value);
    setInvalid(!valid);
    if (!valid) {
      document.getElementById("phone-input")?.focus();
      return;
    }

    // A different number must be verified again (the old site kept the
    // previous number's "verified" flag).
    if (getLoggedInPhone() !== value) setVerified(false);
    setCheckoutPhone(value);
    setSending(true);
    setSendError("");
    const sent = await requestOtp(value);
    // A code sent a moment ago is still valid: carry on to the code step.
    if (!sent.ok && !sent.retryAfter) {
      setSending(false);
      setSendError(sent.error);
      return;
    }
    router.push("/checkout/otp");
  }

  return (
    <section className="auth-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <Link href="/cart">سبد خرید</Link> / <span>ورود</span>
        </p>
        <div className="auth-card">
          <AuthSteps step={1} />
          <p className="auth-eyebrow">مرحله ۱ از ۴ · ورود یا ثبت‌نام</p>
          <h1>شماره موبایلت رو وارد کن</h1>
          <p className="auth-sub">برای ادامه‌ی خرید، یه کد تأیید براش می‌فرستیم. نیازی به رمز عبور نیست.</p>
          <form className="auth-form" id="phone-form" noValidate onSubmit={onSubmit}>
            <label htmlFor="phone-input">شماره موبایل</label>
            <input
              type="tel"
              id="phone-input"
              className={"auth-phone-input" + (invalid ? " is-invalid" : "")}
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11))}
            />
            <p className="auth-error" id="phone-error" hidden={!invalid}>
              شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه.
            </p>
            <p className="auth-error" hidden={!sendError || invalid}>
              {sendError}
            </p>
            <button type="submit" className="auth-submit-btn" id="phone-submit-btn" disabled={sending}>
              {sending ? (
                "در حال ارسال کد..."
              ) : (
                <>
                  دریافت کد تأیید
                  <i className="ri-arrow-left-line"></i>
                </>
              )}
            </button>
          </form>
          <p className="auth-legal">
            با ادامه، <Link href="/terms">قوانین و مقررات</Link> ReySo رو می‌پذیری.
          </p>
        </div>
      </div>
    </section>
  );
}
