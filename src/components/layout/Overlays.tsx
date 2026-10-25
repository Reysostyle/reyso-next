"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUi } from "@/components/UiProvider";
import { addToCart, cartCount, useCart } from "@/lib/cart";
import { removeFromWishlist, useWishlist } from "@/lib/wishlist";
import { useCatalog, useProductLookup } from "@/components/CatalogProvider";
import { formatToman, productHref } from "@/lib/products";
import { CountBadge } from "./CountBadge";
import { LoginButton, NAV_LINKS, isActiveNav } from "./Header";

/* eslint-disable @next/next/no-img-element */

// Wishlist panel, mobile menu and search overlay. Kept outside <header>
// on purpose: a transform/backdrop-filter on the header would break
// their fixed positioning.

export function WishlistPanel() {
  const { wishlistOpen, setWishlistOpen, showCartToast } = useUi();
  const wishlist = useWishlist();
  const getProductById = useProductLookup();

  return (
    <>
      <div className={"wishlist-panel" + (wishlistOpen ? " open" : "")}>
        <button className="wishlist-panel-close" aria-label="بستن" onClick={() => setWishlistOpen(false)}>
          <i className="ri-close-line"></i>
        </button>
        <h4>علاقه‌مندی‌ها</h4>
        <ul className="wishlist-panel-list">
          {wishlist.map((id) => {
            const product = getProductById(id);
            return (
              <li key={id}>
                {product ? (
                  <Link
                    href={productHref(product.id)}
                    className="wishlist-panel-link"
                    onClick={() => setWishlistOpen(false)}
                  >
                    <img src={product.images[0]} alt={product.name} />
                    <span>{product.name}</span>
                  </Link>
                ) : (
                  <span>{id}</span>
                )}
                <button
                  aria-label="افزودن به سبد خرید"
                  title="افزودن به سبد خرید"
                  disabled={!product}
                  onClick={() => {
                    if (!product) return;
                    const color = product.colors[0];
                    const item = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: color.image,
                      size: product.sizes.find((s) => !product.soldOutSizes.includes(s)) ?? product.sizes[0],
                      color: color.name,
                      qty: 1,
                    };
                    addToCart(item);
                    showCartToast(item);
                    setWishlistOpen(false);
                  }}
                >
                  <i className="ri-shopping-bag-line"></i>
                </button>
                <button aria-label="حذف از علاقه‌مندی‌ها" onClick={() => removeFromWishlist(id)}>
                  <i className="ri-close-line"></i>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="wishlist-empty" style={{ display: wishlist.length ? "none" : "block" }}>
          هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌اید.
        </p>
      </div>
      <div
        className={"wishlist-backdrop" + (wishlistOpen ? " open" : "")}
        onClick={() => setWishlistOpen(false)}
      ></div>
    </>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const { setMenuOpen, setSearchOpen, setWishlistOpen } = useUi();
  const cart = useCart();
  const wishlist = useWishlist();
  const close = () => setMenuOpen(false);

  return (
    <>
      <div className="mobile-menu">
        <div className="mobile-menu-head">
          <Link href="/" className="mobile-menu-logo" onClick={close}>
            <img src="/images/headerlogo.png" alt="ReySo Logo" />
          </Link>
          <button className="menu-close" aria-label="بستن منو" onClick={close}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <ul className="mobile-menu-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActiveNav(pathname, link.href) ? "active" : undefined}
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-menu-actions">
          <button
            className="search-nav-btn mobile-search-btn"
            aria-label="جستجو"
            onClick={() => {
              close();
              setSearchOpen(true);
            }}
          >
            <i className="ri-search-line"></i>
            جستجو
          </button>
          <Link href="/cart" className="cart" onClick={close}>
            <i className="ri-shopping-bag-line"></i>
            سبد خرید
            <CountBadge className="cart-count" count={cartCount(cart)} />
          </Link>
          <button
            className={"wishlist-nav-btn mobile-wishlist-btn" + (wishlist.length > 0 ? " active" : "")}
            aria-label="علاقه‌مندی‌ها"
            onClick={() => {
              close();
              setWishlistOpen(true);
            }}
          >
            <i className="ri-heart-line"></i>
            علاقه‌مندی‌ها
            <CountBadge className="wishlist-count" count={wishlist.length} />
          </button>
          <span onClick={close}>
            <LoginButton />
          </span>
        </div>
      </div>

      <div className="mobile-menu-backdrop" onClick={close}></div>
    </>
  );
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUi();
  const [query, setQuery] = useState("");
  const [wasOpen, setWasOpen] = useState(searchOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start every search fresh.
  if (searchOpen !== wasOpen) {
    setWasOpen(searchOpen);
    if (searchOpen) setQuery("");
  }

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [searchOpen]);

  const { products } = useCatalog();
  const q = query.trim().toLowerCase();
  const matches = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : products;
  const close = () => setSearchOpen(false);

  return (
    <>
      <div className={"search-overlay" + (searchOpen ? " open" : "")}>
        <div className="search-overlay-box">
          <button className="search-overlay-close" aria-label="بستن" onClick={close}>
            <i className="ri-close-line"></i>
          </button>
          <div className="search-overlay-field">
            <i className="ri-search-line"></i>
            <input
              ref={inputRef}
              type="text"
              id="search-input"
              placeholder="دنبال چی می‌گردی؟"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="search-overlay-results" id="search-results">
            {matches.map((p) => (
              <Link key={p.id} href={productHref(p.id)} className="search-result-item" onClick={close}>
                <img src={p.images[0]} alt={p.name} />
                <div className="search-result-info">
                  <p>{p.name}</p>
                  <span>{formatToman(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="search-overlay-empty" id="search-empty" hidden={matches.length > 0}>
            محصولی با این مشخصات پیدا نشد.
          </p>
        </div>
      </div>
      <div className={"search-overlay-backdrop" + (searchOpen ? " open" : "")} onClick={close}></div>
    </>
  );
}
