"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUi } from "@/components/UiProvider";
import { REYSO_CONFIG, contactLinks } from "@/lib/config";
import { cartCount, useCart } from "@/lib/cart";
import { CountBadge } from "./CountBadge";

/* eslint-disable @next/next/no-img-element */

// Floating WhatsApp/Telegram buttons. Only shown for channels that have
// a number/handle configured; the old site rendered them with empty
// links that went nowhere.
export function FloatingContact() {
  const links = contactLinks();
  if (!REYSO_CONFIG.WHATSAPP_NUMBER && !REYSO_CONFIG.TELEGRAM_USERNAME) return null;

  return (
    <div id="floating-contact" className="floating-contact">
      {REYSO_CONFIG.WHATSAPP_NUMBER && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener"
          className="floating-contact-btn wa"
          aria-label="گفتگو در واتس‌اپ"
        >
          <i className="ri-whatsapp-line"></i>
        </a>
      )}
      {REYSO_CONFIG.TELEGRAM_USERNAME && (
        <a
          href={links.telegram}
          target="_blank"
          rel="noopener"
          className="floating-contact-btn tg"
          aria-label="گفتگو در تلگرام"
        >
          <i className="ri-telegram-line"></i>
        </a>
      )}
    </div>
  );
}

const TABS = [
  { href: "/", icon: "ri-home-5-line", label: "خانه", match: ["/"] },
  { href: "/collections", icon: "ri-apps-2-line", label: "دسته‌بندی", match: ["/collections", "/shop"] },
  { href: "/cart", icon: "ri-shopping-bag-line", label: "سبد خرید", match: ["/cart"], badge: true },
  { href: "/profile", icon: "ri-user-line", label: "پروفایل", match: ["/profile"] },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const cart = useCart();

  return (
    <div id="mobile-tab-bar" className="mobile-tab-bar">
      {TABS.map((tab) => {
        const active = tab.match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
        return (
          <Link key={tab.href} href={tab.href} className={"mobile-tab-item" + (active ? " active" : "")}>
            <span className="mobile-tab-icon">
              <i className={tab.icon}></i>
              {tab.badge && <CountBadge className="cart-count" count={cartCount(cart)} />}
            </span>
            <span className="mobile-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

// Add-to-cart confirmation, shared by quick view, product page and the
// wishlist panel.
export function CartToast() {
  const { cartToast, showCartToast } = useUi();

  useEffect(() => {
    if (!cartToast) return;
    const t = setTimeout(() => showCartToast(null), 5000);
    return () => clearTimeout(t);
  }, [cartToast, showCartToast]);

  const item = cartToast?.item;
  const visible = item ? " is-visible" : "";
  const hide = () => showCartToast(null);

  return (
    <>
      <div id="reyso-toast-overlay" className={"reyso-toast-overlay" + visible} onClick={hide}></div>
      <div id="reyso-toast" className={"reyso-toast" + visible} role="status">
        {item && (
          <>
            <button type="button" className="reyso-toast-close" aria-label="بستن" onClick={hide}>
              <i className="ri-close-line"></i>
            </button>
            {item.image ? (
              <img src={item.image} alt="" />
            ) : (
              <span className="reyso-toast-icon">
                <i className="ri-check-line"></i>
              </span>
            )}
            <div className="reyso-toast-text">
              <span className="reyso-toast-title">{item.name} به سبد اضافه شد</span>
              <span className="reyso-toast-meta">
                سایز: {item.size} | رنگ: {item.color}
              </span>
            </div>
            <div className="reyso-toast-actions">
              <Link href="/cart" className="reyso-toast-link" onClick={hide}>
                مشاهده سبد خرید
              </Link>
              <button type="button" className="reyso-toast-continue" onClick={hide}>
                ادامه خرید
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
