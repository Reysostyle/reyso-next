"use client";

import { useLayoutEffect, useRef } from "react";

// Grids whose items come in one after another.
const GRIDS = [
  ".product-grid",
  ".category-grid",
  ".col-grid",
  ".edu-grid",
  ".recent-grid",
  ".about-values-grid",
  ".pd-grid",
].join(", ");
// Everything else: the blocks of each section. The home hero and the story
// section already have their own animations.
const BLOCKS = "section:not(.hero):not(.story) > .container > *";

const MAX_STAGGER = 8;

function show(el: HTMLElement, order: number) {
  el.style.setProperty("--rv-i", String(Math.min(order, MAX_STAGGER)));
  el.classList.add("rv-in");
  // Hand the element back to its own styles (hover transitions and all)
  // once it has arrived.
  window.setTimeout(
    () => {
      el.classList.remove("rv", "rv-in");
      el.style.removeProperty("--rv-i");
    },
    900 + Math.min(order, MAX_STAGGER) * 90,
  );
}

// Wraps each storefront page (app/(frontend)/template.tsx, so it remounts
// on every navigation): the page fades in, and its blocks and grid items
// rise into view as they scroll into the viewport. Without JavaScript, or
// with reduced motion, everything is simply visible.
export function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const seen = new WeakSet<Element>();
    // Grids are watched as a whole (some scroll sideways, so their items
    // never enter the viewport themselves); their items follow in order.
    const shownGrids = new WeakSet<Element>();
    const revealGrid = (grid: Element) => {
      let i = 0;
      grid.querySelectorAll<HTMLElement>(":scope > .rv:not(.rv-in)").forEach((item) => show(item, i++));
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Blocks that appear together are staggered in reading order.
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          if (entry.target.matches(GRIDS)) {
            shownGrids.add(entry.target);
            revealGrid(entry.target);
          } else {
            show(entry.target as HTMLElement, i++);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const scan = () => {
      el.querySelectorAll<HTMLElement>(BLOCKS).forEach((block) => {
        if (seen.has(block) || block.matches(GRIDS)) return;
        seen.add(block);
        block.classList.add("rv");
        io.observe(block);
      });
      el.querySelectorAll(GRIDS).forEach((grid) => {
        let fresh = false;
        grid.querySelectorAll<HTMLElement>(":scope > *").forEach((item) => {
          if (seen.has(item)) return;
          seen.add(item);
          item.classList.add("rv");
          fresh = true;
        });
        if (!seen.has(grid)) {
          seen.add(grid);
          io.observe(grid);
        } else if (fresh && shownGrids.has(grid)) {
          // New items in a grid already on screen (filters, late data).
          requestAnimationFrame(() => revealGrid(grid));
        }
      });
    };
    scan();

    let queued = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(scan);
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(queued);
    };
  }, []);

  return (
    <div ref={root} className="page-motion">
      {children}
    </div>
  );
}
