"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUi } from "@/components/UiProvider";
import { cartCount, useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useIsReturningCustomer } from "@/lib/customer";
import { CountBadge } from "./CountBadge";

export const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "محصولات" },
  { href: "/collections", label: "کالکشن‌ها" },
  { href: "/education", label: "آموزش" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "ارتباط با ما" },
];

export function isActiveNav(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function LoginButton() {
  const loggedIn = useIsReturningCustomer();
  return loggedIn ? (
    <Link href="/profile" className="login-btn is-logged-in">
      <i className="ri-user-3-line"></i> پروفایل من
    </Link>
  ) : (
    <Link href="/checkout/phone" className="login-btn">
      ورود / ثبت‌نام
    </Link>
  );
}

function useHeaderScroll() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    // Hysteresis (enter past 60px, leave under 20px) so the header
    // doesn't flicker when the scroll position hovers at the edge.
    const ENTER_AT = 60;
    const EXIT_AT = 20;
    const DEADZONE = 5;
    let ticking = false;
    lastY.current = window.scrollY;

    function apply() {
      const y = window.scrollY;
      if (y > ENTER_AT) setScrolled(true);
      else if (y < EXIT_AT) setScrolled(false);

      const delta = y - lastY.current;
      if (y <= EXIT_AT) setHidden(false);
      else if (delta > DEADZONE) setHidden(true);
      else if (delta < -DEADZONE) setHidden(false);

      lastY.current = y;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled, hidden };
}

export function Header() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen, setSearchOpen, setWishlistOpen } = useUi();
  const cart = useCart();
  const wishlist = useWishlist();
  const { scrolled, hidden } = useHeaderScroll();

  const className = [scrolled && "scrolled", hidden && "header-hidden"].filter(Boolean).join(" ");

  return (
    <header className={className || undefined}>
      <div className="container nav">
        <button
          className="menu-toggle"
          aria-label="باز کردن منو"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="logo">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/headerlogo.png" alt="ReySo Logo" />
          </Link>
        </div>

        <nav>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={isActiveNav(pathname, link.href) ? "active" : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-right">
          <button className="search-nav-btn" aria-label="جستجو" onClick={() => setSearchOpen(true)}>
            <i className="ri-search-line"></i>
          </button>

          <Link href="/cart" className="cart">
            <i className="ri-shopping-bag-line"></i>
            <span className="cart-label">سبد خرید</span>
            <CountBadge className="cart-count" count={cartCount(cart)} />
          </Link>

          <div className="wishlist-nav">
            <button
              className={"wishlist-nav-btn" + (wishlist.length > 0 ? " active" : "")}
              aria-label="علاقه‌مندی‌ها"
              onClick={() => setWishlistOpen(true)}
            >
              <i className="ri-heart-line"></i>
              <CountBadge className="wishlist-count" count={wishlist.length} />
            </button>
          </div>

          <LoginButton />
        </div>
      </div>
    </header>
  );
}
