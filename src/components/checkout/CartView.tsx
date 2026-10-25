"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  type CartLine,
  cartSubtotal,
  insertCartLine,
  removeCartLine,
  updateCartLineQty,
  useCart,
} from "@/lib/cart";
import { isReturningCustomer } from "@/lib/customer";
import { formatToman } from "@/lib/products";
import { useHydrated } from "@/lib/use-hydrated";

/* eslint-disable @next/next/no-img-element */

const UNDO_MS = 5000;

export function CartView() {
  const router = useRouter();
  const cart = useCart();
  const hydrated = useHydrated();
  const [removed, setRemoved] = useState<{ line: CartLine; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  function remove(index: number) {
    const line = removeCartLine(index);
    if (!line) return;
    setRemoved({ line, index });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemoved(null), UNDO_MS);
  }

  function undo() {
    if (!removed) return;
    insertCartLine(removed.line, removed.index);
    setRemoved(null);
    clearTimeout(undoTimer.current);
  }

  const subtotal = cartSubtotal(cart);
  // Until localStorage has been read, show neither the list nor the
  // empty state, so a full cart never flashes "empty".
  const empty = hydrated && cart.length === 0;

  return (
    <>
      <section className="cart-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <span>سبد خرید</span>
          </p>
          <h1 className="cart-title">سبد خرید شما</h1>
          <div className="cart-layout" id="cart-layout" hidden={!hydrated || empty}>
            <div className="cart-items" id="cart-items">
              {cart.map((line, index) => (
                <div className="cart-item" key={`${line.id}-${line.size}-${line.color}`}>
                  <img loading="lazy" src={line.image} alt={line.name} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{line.name}</p>
                    <p className="cart-item-meta">
                      سایز: {line.size} &nbsp;|&nbsp; رنگ: {line.color}
                    </p>
                    <button type="button" className="cart-item-remove" onClick={() => remove(index)}>
                      <i className="ri-delete-bin-line"></i> حذف
                    </button>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="cart-qty-minus"
                      onClick={() => updateCartLineQty(index, line.qty - 1)}
                    >
                      −
                    </button>
                    <span>{line.qty.toLocaleString("fa-IR")}</span>
                    <button
                      type="button"
                      className="cart-qty-plus"
                      onClick={() => updateCartLineQty(index, line.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-item-price">{formatToman(line.price * line.qty)}</p>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h4>خلاصه سفارش</h4>
              <div className="cart-summary-row">
                <span>جمع جزء</span>
                <span id="cart-subtotal">{formatToman(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>هزینه ارسال</span>
                <span className="cart-shipping-free">رایگان</span>
              </div>
              <div className="cart-summary-divider"></div>
              <div className="cart-summary-row cart-summary-total">
                <span>مبلغ نهایی</span>
                <span id="cart-total">{formatToman(subtotal)}</span>
              </div>
              <button
                type="button"
                className="cart-checkout-btn"
                id="cart-checkout-btn"
                onClick={() =>
                  // Logged in from an earlier visit: skip phone/OTP. The
                  // review step falls back to the profile step if needed.
                  router.push(isReturningCustomer() ? "/checkout/review" : "/checkout/phone")
                }
              >
                ادامه فرآیند خرید
                <i className="ri-arrow-left-line"></i>
              </button>
              <Link href="/shop" className="cart-continue-link">
                <i className="ri-arrow-left-line"></i> ادامه خرید
              </Link>
              <p className="cart-secure-note">
                <i className="ri-shield-check-line"></i>
                پرداخت امن و ضمانت اصالت کالا
              </p>
            </div>
          </div>
          <div className="cart-empty" id="cart-empty" hidden={!empty}>
            <i className="ri-shopping-bag-3-line"></i>
            <p>سبد خرید شما هنوز خالیه</p>
            <Link href="/shop" className="cart-empty-btn">
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>

      <div id="reyso-undo-toast" className={"reyso-undo-toast" + (removed ? " is-visible" : "")}>
        {removed && (
          <>
            <span className="reyso-undo-text">«{removed.line.name}» حذف شد</span>
            <button type="button" className="reyso-undo-btn" onClick={undo}>
              بازگردانی
            </button>
          </>
        )}
      </div>
    </>
  );
}
