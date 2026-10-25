"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartSubtotal, clearCart, getCart } from "@/lib/cart";
import {
  type Address,
  getCustomerAddresses,
  getDefaultAddress,
  getMockCustomer,
  saveMockCustomer,
} from "@/lib/customer";
import { type AppliedDiscount, resolveDiscountCode } from "@/lib/discounts";
import { LAST_ORDER_ID_KEY, submitOrder, telegramBotLink } from "@/lib/orders";
import { formatToman } from "@/lib/products";
import { AuthSteps, hasFullProfile } from "./AuthSteps";
import { useVerifiedPhone } from "./useCheckoutGuard";

const SHIPPING_LABELS: Record<string, string> = { post: "پست پیشتاز", courier: "ارسال با پیک" };

function formatAddressText(addr: Address): string {
  return [addr.province, addr.city, addr.full].filter(Boolean).join("، ") + "، کدپستی " + addr.postal;
}

export function ReviewStep() {
  const phone = useVerifiedPhone();
  return (
    <section className="review-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <Link href="/cart">سبد خرید</Link> / <span>بازبینی سفارش</span>
        </p>
        <div className="review-head">
          <AuthSteps step={4} />
          <p className="auth-eyebrow">مرحله ۴ از ۴ · بازبینی و پرداخت</p>
          <h1>سفارشت رو یه بار مرور کن</h1>
          <p className="auth-sub">قبل از ثبت نهایی، آدرس و اقلام سفارشت رو بررسی کن.</p>
        </div>
        {phone && <ReviewContent phone={phone} />}
      </div>
    </section>
  );
}

function ReviewContent({ phone }: { phone: string }) {
  const router = useRouter();
  // Snapshot on mount: the order is built from what was reviewed.
  const [{ customer, addresses, cart }] = useState(() => {
    const c = getMockCustomer(phone);
    return { customer: c, addresses: getCustomerAddresses(c), cart: getCart() };
  });
  const defaultAddress = getDefaultAddress(customer);
  const ready = hasFullProfile(customer, defaultAddress) && cart.length > 0;

  const [selectedId, setSelectedId] = useState(defaultAddress?.id);
  const [telegram, setTelegram] = useState(String(customer?.telegram ?? ""));
  const [notes, setNotes] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [discountNote, setDiscountNote] = useState("");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasFullProfile(customer, defaultAddress)) router.replace("/checkout/details");
    else if (cart.length === 0) router.replace("/cart");
  }, [customer, defaultAddress, cart.length, router]);

  if (!ready || !customer || !defaultAddress) return null;

  const selected = addresses.find((a) => a.id === selectedId) ?? defaultAddress;
  const fullName = customer.firstName + " " + customer.lastName;
  const shippingCost = 0;
  const subtotal = cartSubtotal(cart);
  const total = Math.max(0, subtotal - (discount?.amount ?? 0) + shippingCost);

  function applyDiscount() {
    const raw = discountInput.trim();
    if (!raw) {
      setDiscount(null);
      setDiscountNote("یه کد وارد کن.");
      return;
    }
    const resolved = resolveDiscountCode(raw, subtotal);
    setDiscount(resolved);
    setDiscountNote(
      resolved ? "کد «" + resolved.code + "» اعمال شد — " + resolved.label + "." : "این کد تخفیف معتبر نیست.",
    );
  }

  async function submit() {
    const tg = telegram.trim().replace(/^@/, "");
    setFormNote("");
    setSubmitting(true);

    const result = await submitOrder({
      createdAt: new Date().toISOString(),
      customer: {
        name: fullName,
        phone,
        telegram: tg,
        address: formatAddressText(selected),
        shipping: customer!.shipping || "post",
      },
      items: cart,
      subtotal,
      shippingCost,
      discountCode: discount?.code ?? "",
      discountAmount: discount?.amount ?? 0,
      total,
      notes: notes.trim(),
    });

    if (!result.ok) {
      setSubmitting(false);
      setFormNote(
        "ثبت سفارش انجام نشد. اتصال اینترنت رو بررسی کن و دوباره امتحان کن، یا از اینستاگرام پیام بده.",
      );
      return;
    }

    localStorage.setItem(LAST_ORDER_ID_KEY, result.orderId);
    clearCart();
    if (tg) saveMockCustomer(phone, { telegram: tg });
    // No payment page yet: the profile lists the new order with a banner.
    router.push("/profile?new_order=" + encodeURIComponent(result.orderId));
  }

  return (
    <div className="review-layout">
      <div className="review-main">
        <div className="review-card">
          <h3 className="review-card-title">
            <i className="ri-map-pin-line"></i> اطلاعات ارسال
          </h3>
          <div className="review-info-rows">
            <div className="review-info-row">
              <span className="review-info-label">گیرنده</span>
              <span id="review-name">{fullName}</span>
            </div>
            <div className="review-info-row">
              <span className="review-info-label">شماره تماس</span>
              <bdi id="review-phone" dir="ltr">
                {phone}
              </bdi>
            </div>
            <div className="review-info-row">
              <span className="review-info-label">روش ارسال</span>
              <span id="review-shipping">
                {SHIPPING_LABELS[customer.shipping ?? ""] ?? SHIPPING_LABELS.post}
              </span>
            </div>
          </div>
          <div className="review-address-picker" id="review-address-picker">
            {addresses.length <= 1 ? (
              <>
                <span className="review-info-label">آدرس</span>
                <div className="review-address-simple">{formatAddressText(selected)}</div>
              </>
            ) : (
              <>
                <span className="review-address-picker-label">این سفارش به کدوم آدرس ارسال بشه؟</span>
                {addresses.map((addr) => (
                  <label key={addr.id} className="review-address-option">
                    <input
                      type="radio"
                      name="review-address-choice"
                      value={addr.id}
                      checked={addr.id === selected.id}
                      onChange={() => setSelectedId(addr.id)}
                    />
                    <span className="review-address-radio"></span>
                    <span className="review-address-option-text">
                      <span className="review-address-option-label">
                        {addr.label || "آدرس"}
                        {addr.isDefault && <span className="review-address-option-badge">پیش‌فرض</span>}
                      </span>
                      <span className="review-address-option-detail">{formatAddressText(addr)}</span>
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
          <Link href="/checkout/details" className="review-edit-link">
            <i className="ri-pencil-line"></i> ویرایش اطلاعات
          </Link>
        </div>
        <div className="review-card">
          <h3 className="review-card-title">
            <i className="ri-telegram-line"></i> اطلاع‌رسانی سفارش (اختیاری)
          </h3>
          <label htmlFor="review-telegram" className="review-label">
            یوزرنیم تلگرام (اختیاری)
          </label>
          <input
            type="text"
            id="review-telegram"
            className="review-input"
            placeholder="مثلاً sara_m@"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
          <p className="review-hint">
            وضعیت سفارشت با پیامک اطلاع داده می‌شه. اگه دوست داری از طریق تلگرام هم باخبر بشی، یوزرنیمت رو
            وارد کن و{" "}
            <a href={telegramBotLink()} id="review-bot-link" target="_blank" rel="noopener">
              ربات تلگرام ReySo
            </a>{" "}
            رو استارت بزن.
          </p>
          <label htmlFor="review-notes" className="review-label review-label-spaced">
            یادداشت (اختیاری)
          </label>
          <input
            type="text"
            id="review-notes"
            className="review-input"
            placeholder="توضیح اضافه در مورد سفارش"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
      <aside className="review-aside">
        <div className="review-summary-card">
          <h4>خلاصه سفارش</h4>
          <div className="review-summary-items" id="review-summary-items">
            {cart.map((line) => (
              <div key={`${line.id}-${line.size}-${line.color}`} className="review-order-item">
                <span>
                  {line.name} ({line.size}، {line.color}) ×{line.qty.toLocaleString("fa-IR")}
                </span>
                <span>{formatToman(line.price * line.qty)}</span>
              </div>
            ))}
          </div>
          <div className="review-divider"></div>
          <div className="review-summary-row">
            <span>جمع کالاها</span>
            <span id="review-subtotal">{formatToman(subtotal)}</span>
          </div>
          <div className="review-summary-row">
            <span>هزینه ارسال</span>
            <span id="review-shipping-cost">{shippingCost > 0 ? formatToman(shippingCost) : "رایگان"}</span>
          </div>
          <div
            className="review-summary-row review-summary-discount"
            id="review-discount-row"
            hidden={!discount}
          >
            <span id="review-discount-label">{discount?.label ?? "تخفیف"}</span>
            <span id="review-discount-amount">−{formatToman(discount?.amount ?? 0)}</span>
          </div>
          <div className="review-divider"></div>
          <div className="review-summary-row review-summary-total">
            <span>مبلغ نهایی</span>
            <span id="review-total">{formatToman(total)}</span>
          </div>
          <div className="review-discount">
            <input
              type="text"
              id="review-discount"
              placeholder="کد تخفیف (اختیاری)"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
            />
            <button type="button" id="review-discount-apply" onClick={applyDiscount}>
              اعمال کد
            </button>
          </div>
          <p className="review-discount-note" id="review-discount-note" hidden={!discountNote}>
            {discountNote}
          </p>
          <button
            type="button"
            className="review-submit-btn"
            id="review-submit-btn"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? (
              "در حال ثبت سفارش..."
            ) : (
              <>
                تأیید اطلاعات و ثبت سفارش
                <i className="ri-arrow-left-line"></i>
              </>
            )}
          </button>
          <p className="review-form-note" id="review-form-note" hidden={!formNote}>
            {formNote}
          </p>
          <p className="review-secure-note">
            <i className="ri-shield-check-line"></i>
            ثبت امن سفارش با شماره‌ی تأییدشده‌ی شما؛ هماهنگی پرداخت از طریق تلگرام
          </p>
        </div>
      </aside>
    </div>
  );
}
