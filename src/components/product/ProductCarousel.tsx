"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

// Single-row product slider: drag with mouse/finger, arrow buttons, and
// a slow auto-advance that pauses on hover or interaction. Used by the
// homepage best-sellers row and "recently viewed".

function stepSize(viewport: HTMLElement): number {
  const card = viewport.querySelector(".product-card");
  const grid = viewport.querySelector(".recent-grid");
  if (!card || !grid) return 300;
  const style = getComputedStyle(grid);
  const gap = parseFloat(style.columnGap || style.gap || "16");
  return card.getBoundingClientRect().width + gap;
}

// In RTL, modern browsers report scrollLeft as 0 at the start and
// negative values going forward.
function scrollByStep(viewport: HTMLElement, forward: boolean) {
  const max = viewport.scrollWidth - viewport.clientWidth;
  const atStart = Math.abs(viewport.scrollLeft) < 2;
  const atEnd = Math.abs(Math.abs(viewport.scrollLeft) - max) < 2;
  const dir = viewport.scrollLeft <= 0 ? -1 : 1;

  if (forward && atEnd) {
    viewport.scrollTo({ left: 0, behavior: "smooth" });
  } else if (!forward && atStart) {
    viewport.scrollTo({ left: dir * max, behavior: "smooth" });
  } else {
    const amount = stepSize(viewport);
    viewport.scrollBy({ left: forward ? dir * amount : -dir * amount, behavior: "smooth" });
  }
}

type Props = {
  products: Product[];
  autoMs: number;
  ids: { prev: string; next: string; viewport: string; grid: string };
  arrowClassPrefix?: boolean;
};

export function ProductCarousel({ products, autoMs, ids, arrowClassPrefix }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAuto = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const startAuto = () => {
    stopAuto();
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 2) return;
    timer.current = setInterval(() => scrollByStep(viewport, true), autoMs);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let isDown = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add("dragging");
      stopAuto();
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 3) moved = true;
      viewport.scrollLeft = startScroll + delta;
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove("dragging");
      startAuto();
    };
    // Don't open the product after an actual drag gesture.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("pointerleave", onUp);
    viewport.addEventListener("click", onClick, true);
    const t = setTimeout(startAuto, 300);

    return () => {
      clearTimeout(t);
      stopAuto();
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("pointerleave", onUp);
      viewport.removeEventListener("click", onClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const onArrow = (forward: boolean) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    stopAuto();
    scrollByStep(viewport, forward);
    startAuto();
  };

  return (
    <div className="recent-carousel">
      <button
        type="button"
        className={"recent-arrow" + (arrowClassPrefix ? " recent-prev" : "")}
        id={ids.prev}
        aria-label="قبلی"
        onClick={() => onArrow(false)}
      >
        <i className="ri-arrow-right-s-line"></i>
      </button>
      <div
        className="recent-viewport"
        id={ids.viewport}
        ref={viewportRef}
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <div className="recent-grid" id={ids.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} draggable={false} />
          ))}
        </div>
      </div>
      <button
        type="button"
        className={"recent-arrow" + (arrowClassPrefix ? " recent-next" : "")}
        id={ids.next}
        aria-label="بعدی"
        onClick={() => onArrow(true)}
      >
        <i className="ri-arrow-left-s-line"></i>
      </button>
    </div>
  );
}
