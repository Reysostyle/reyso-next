"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUi } from "@/components/UiProvider";
import { addToCart } from "@/lib/cart";
import { type Product, SIZE_GUIDE, formatToman } from "@/lib/products";
import { WishlistButton } from "@/components/product/ProductCard";
import {
  ColorOptions,
  DiscountBadge,
  QtyStepper,
  SizeOptions,
  firstAvailableSize,
} from "@/components/product/ProductOptions";
import { RecentlyViewed, useTrackProductView } from "@/components/product/RecentlyViewed";

/* eslint-disable @next/next/no-img-element */

// Main image with press-and-hold zoom (mouse, touch and pen).
function GalleryMain({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");

  function track(e: React.PointerEvent) {
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(x + "% " + y + "%");
  }

  function release() {
    setZoomed(false);
    setOrigin("center center");
  }

  return (
    <div
      className={"pd-gallery-main" + (zoomed ? " zoomed" : "")}
      id="pd-gallery-main"
      ref={wrapRef}
      onPointerDown={(e) => {
        track(e);
        setZoomed(true);
      }}
      onPointerMove={(e) => zoomed && track(e)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      <img id="pd-main-image" src={src} alt={alt} style={{ transformOrigin: origin }} />
      <span className="pd-zoom-hint">
        <i className="ri-zoom-in-line"></i> برای بزرگ‌نمایی نگه دار
      </span>
    </div>
  );
}

function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={"qv-modal" + (open ? " open" : "")} id="size-guide-modal">
      <div className="qv-backdrop" onClick={onClose}></div>
      <div className="qv-box sg-box">
        <button type="button" className="qv-close" aria-label="بستن" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
        <div className="sg-content">
          <h3>راهنمای سایز</h3>
          <p className="sg-note">
            اندازه‌ها بر حسب سانتی‌متر و بر اساس دور بدن است؛ در صورت بین دو سایز بودن، سایز بزرگ‌تر رو انتخاب
            کن.
          </p>
          <table className="sg-table">
            <thead>
              <tr>
                <th>سایز</th>
                <th>دور سینه</th>
                <th>دور کمر</th>
                <th>دور باسن</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row) => (
                <tr key={row.size}>
                  <td>{row.size}</td>
                  <td>{row.bust}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const { showCartToast } = useUi();
  const [size, setSize] = useState(() => firstAvailableSize(product));
  const [colorIndex, setColorIndex] = useState(0);
  const [mainImage, setMainImage] = useState(product.colors[0].image);
  const [qty, setQty] = useState(1);
  const [noteVisible, setNoteVisible] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const color = product.colors[colorIndex];

  useTrackProductView(product.id);

  // Sticky add-to-cart bar once the main button has scrolled away.
  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(noteTimer.current), []);

  function add() {
    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: color.image,
      size,
      color: color.name,
      qty,
    };
    addToCart(item);
    showCartToast(item);
    setNoteVisible(true);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNoteVisible(false), 2500);
  }

  return (
    <>
      <section className="pd-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <Link href="/shop">محصولات</Link> /{" "}
            <span className="pd-crumb-current">{product.name}</span>
          </p>

          <div className="pd-grid">
            <div className="pd-gallery">
              <GalleryMain src={mainImage} alt={product.name} />
              <div className="pd-thumbs" id="pd-thumbs">
                {product.images.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={src === mainImage ? "active" : undefined}
                    onClick={() => setMainImage(src)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-info">
              <div className="pd-rating">
                <span
                  className="pd-stars"
                  id="pd-stars"
                  aria-label={product.rating.toLocaleString("fa-IR") + " از ۵"}
                >
                  {"★".repeat(product.rating) + "☆".repeat(5 - product.rating)}
                </span>
                <span id="pd-reviews">({product.reviews.toLocaleString("fa-IR")} نظر)</span>
              </div>

              <h1 id="pd-name">{product.name}</h1>

              <p className="pd-desc" id="pd-desc">
                {product.description}
              </p>

              <div className="pd-price">
                <span className="now" id="pd-price-now">
                  {formatToman(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="was" id="pd-price-old">
                    {formatToman(product.oldPrice)}
                  </span>
                )}
                <DiscountBadge product={product} />
              </div>

              <div className="pd-block">
                <div className="pd-block-head">
                  <p>سایز</p>
                  <button
                    type="button"
                    className="pd-size-guide-btn"
                    id="pd-size-guide-btn"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    راهنمای سایز
                  </button>
                </div>
                <SizeOptions product={product} value={size} onChange={setSize} />
              </div>

              <div className="pd-block">
                <p>رنگ</p>
                <ColorOptions
                  product={product}
                  value={colorIndex}
                  onChange={(i) => {
                    setColorIndex(i);
                    setMainImage(product.colors[i].image);
                  }}
                />
              </div>

              <div className="pd-block">
                <p>تعداد</p>
                <QtyStepper value={qty} onChange={setQty} />
              </div>

              <div className="pd-cta">
                <button type="button" className="pd-add-btn" id="pd-add-btn" ref={addBtnRef} onClick={add}>
                  افزودن به سبد خرید
                </button>
                <WishlistButton id={product.id} className="pd-wish-btn" />
              </div>

              <ul className="pd-trust">
                <li>
                  <i className="ri-truck-line"></i> ارسال به سراسر ایران
                </li>
                <li>
                  <i className="ri-shield-check-line"></i> ضمانت اصالت پارچه و دوخت
                </li>
                <li>
                  <i className="ri-lock-line"></i> ثبت سفارش امن
                </li>
              </ul>

              <p className="pd-add-note" id="pd-add-note" hidden={!noteVisible}>
                به سبد خرید اضافه شد.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className={"pd-sticky-bar" + (stickyVisible ? " visible" : "")} id="pd-sticky-bar">
        <div className="pd-sticky-info">
          <img id="pd-sticky-img" src={mainImage} alt="" />
          <div>
            <p className="pd-sticky-name">{product.name}</p>
            <p className="pd-sticky-price">{formatToman(product.price)}</p>
          </div>
        </div>
        <button type="button" className="pd-add-btn" id="pd-sticky-add-btn" onClick={add}>
          افزودن به سبد
        </button>
      </div>

      <RecentlyViewed excludeId={product.id} />
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
