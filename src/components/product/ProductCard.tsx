"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUi } from "@/components/UiProvider";
import { toggleWishlist, useWishlist } from "@/lib/wishlist";
import { type Product, formatToman, productHref } from "@/lib/products";

/* eslint-disable @next/next/no-img-element */

const CYCLE_MS = 3200;

// On touch screens :hover never fires, so while a card is on screen it
// alternates between its two photos instead.
function useTouchImageCycle() {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer ??= setInterval(() => setFlipped((f) => !f), CYCLE_MS);
        } else if (timer) {
          clearInterval(timer);
          timer = null;
          setFlipped(false);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  return { ref, flipped };
}

export function WishlistButton({ id, label, className }: { id: string; label?: string; className?: string }) {
  const wishlist = useWishlist();
  const active = wishlist.includes(id);
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <button
      key={pulseKey}
      className={
        (className ? className + " " : "") +
        "wishlist-btn" +
        (active ? " active" : "") +
        (pulseKey ? " pulse" : "")
      }
      data-id={id}
      aria-label={label ?? "افزودن به علاقه‌مندی‌ها"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(id);
        setPulseKey((k) => k + 1);
      }}
    >
      <i className={active ? "ri-heart-fill" : "ri-heart-line"}></i>
    </button>
  );
}

type Props = {
  product: Product;
  wishlistLabel?: string;
  /** false inside drag-scrollable carousels so native drag doesn't fight it */
  draggable?: boolean;
};

export function ProductCard({ product, wishlistLabel, draggable = true }: Props) {
  const { openQuickView } = useUi();
  const { ref, flipped } = useTouchImageCycle();
  const front = product.images[0];
  const back = product.images[1] || front;
  const drag = draggable ? undefined : false;

  return (
    <div className="product-card">
      <WishlistButton id={product.id} label={wishlistLabel} />
      <button
        className="quick-view-btn"
        aria-label="مشاهده سریع"
        onClick={(e) => {
          e.preventDefault();
          openQuickView(product.id);
        }}
      >
        <i className="ri-eye-line"></i>
      </button>
      <Link href={productHref(product.id)} className="product-link" draggable={drag}>
        <div ref={ref} className={"product-media" + (flipped ? " is-flipped" : "")}>
          <img className="img-front" loading="lazy" draggable={drag} src={front} alt={product.name} />
          <img className="img-back" loading="lazy" draggable={drag} src={back} alt={product.name} />
          {product.oldPrice && <span className="shop-card-badge">تخفیف</span>}
        </div>
        <div className="product-info">
          <p className="product-name">{product.name}</p>
          <p className="product-price">{formatToman(product.price)}</p>
        </div>
      </Link>
    </div>
  );
}
