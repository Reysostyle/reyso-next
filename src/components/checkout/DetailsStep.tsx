"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addOrUpdateAddress, getDefaultAddress, getMockCustomer, saveMockCustomer } from "@/lib/customer";
import { AuthSteps } from "./AuthSteps";
import { AddressFields, focusField, isValidName, useAddressForm } from "./AddressFields";
import { useVerifiedPhone } from "./useCheckoutGuard";

const IDS = {
  province: "province-select",
  city: "city-select",
  cityOther: "city-other-input",
  address: "address-input",
  postal: "postal-input",
};

export function DetailsStep() {
  const phone = useVerifiedPhone();
  return (
    <section className="auth-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <Link href="/cart">سبد خرید</Link> / <span>پروفایل و آدرس</span>
        </p>
        <div className="auth-card auth-card-wide">
          <AuthSteps step={3} />
          <p className="auth-eyebrow">مرحله ۳ از ۴ · پروفایل و اطلاعات ارسال</p>
          <h1 id="profile-greeting">اطلاعاتت رو تکمیل کن</h1>
          <p className="auth-sub">
            این اطلاعات برای سفارش‌های بعدیت هم ذخیره می‌مونه، لازم نیست دوباره واردشون کنی.
          </p>
          {/* Mounted once the phone is known, so saved details pre-fill. */}
          {phone && <DetailsForm phone={phone} />}
        </div>
      </div>
    </section>
  );
}

function DetailsForm({ phone }: { phone: string }) {
  const router = useRouter();
  const [{ customer, saved }] = useState(() => {
    const c = getMockCustomer(phone);
    return { customer: c, saved: getDefaultAddress(c) };
  });
  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [nameErrors, setNameErrors] = useState({ first: false, last: false });
  const form = useAddressForm(saved?.full ? saved : null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const first = !isValidName(firstName);
    const last = !isValidName(lastName);
    setNameErrors({ first, last });
    const badAddress = form.validate();

    if (first) return document.getElementById("first-name-input")?.focus();
    if (last) return document.getElementById("last-name-input")?.focus();
    if (badAddress) return focusField(IDS, badAddress, form);

    saveMockCustomer(phone, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      shipping: "post",
      shippingCost: 0,
    });
    addOrUpdateAddress(phone, { label: saved?.label || "آدرس اصلی", ...form.value() }, saved?.id);
    router.push("/checkout/review");
  }

  return (
    <form className="auth-form" id="profile-form" noValidate onSubmit={onSubmit}>
      <div className="auth-form-row">
        <div>
          <label htmlFor="first-name-input">نام</label>
          <input
            type="text"
            id="first-name-input"
            className={"auth-text-input" + (nameErrors.first ? " is-invalid" : "")}
            autoComplete="given-name"
            placeholder="مثلاً سارا"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setNameErrors((x) => ({ ...x, first: false }));
            }}
          />
          <p className="auth-error" id="first-name-error" hidden={!nameErrors.first}>
            نام رو درست وارد کن (بدون عدد).
          </p>
        </div>
        <div>
          <label htmlFor="last-name-input">نام‌خانوادگی</label>
          <input
            type="text"
            id="last-name-input"
            className={"auth-text-input" + (nameErrors.last ? " is-invalid" : "")}
            autoComplete="family-name"
            placeholder="مثلاً محمدی"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setNameErrors((x) => ({ ...x, last: false }));
            }}
          />
          <p className="auth-error" id="last-name-error" hidden={!nameErrors.last}>
            نام‌خانوادگی رو درست وارد کن (بدون عدد).
          </p>
        </div>
      </div>

      <AddressFields form={form} ids={IDS} autoComplete />

      <div className="auth-shipping-note">
        <i className="ri-truck-line"></i>
        ارسال سفارش‌ها با پست پیشتاز انجام می‌شه. بعد از آماده‌سازی، در صورت نیاز به ارسال سریع‌تر (پیک) در
        شهر تهران، هماهنگی جداگانه انجام می‌گیره.
      </div>
      <button type="submit" className="auth-submit-btn">
        ادامه به بازبینی سفارش
        <i className="ri-arrow-left-line"></i>
      </button>
    </form>
  );
}
