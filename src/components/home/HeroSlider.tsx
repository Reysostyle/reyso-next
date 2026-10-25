"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @next/next/no-img-element */

const SLIDES = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
  "/images/hero4.jpg",
  "/images/hero5.jpg",
  "/images/hero6.jpg",
];
const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;

// Stacked-card hero slider: autoplay that pauses on hover, clickable
// dots, and swipe (direction follows the finger, not reading order).
export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const drag = useRef<{ startX: number; delta: number } | null>(null);
  const count = SLIDES.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count]);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  const start = useCallback(() => {
    stop();
    timer.current = setInterval(next, AUTOPLAY_MS);
  }, [next, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  function cardClass(index: number) {
    if (index === current) return "card active";
    if (index === (current + 1) % count) return "card next";
    if (index === (current - 1 + count) % count) return "card prev";
    return "card hidden";
  }

  function endDrag() {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (d.delta <= -SWIPE_THRESHOLD_PX) next();
    else if (d.delta >= SWIPE_THRESHOLD_PX) prev();
    start();
  }

  return (
    <div className="hero-right">
      <div
        className="slider-stack"
        onMouseEnter={stop}
        onMouseLeave={start}
        onPointerDown={(e) => {
          drag.current = { startX: e.clientX, delta: 0 };
          stop();
        }}
        onPointerMove={(e) => {
          if (drag.current) drag.current.delta = e.clientX - drag.current.startX;
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => drag.current && endDrag()}
      >
        {SLIDES.map((src, i) => (
          <div key={src} className={cardClass(i)}>
            <img src={src} alt="ReySo" />
          </div>
        ))}
      </div>

      <div className="slider-dots" role="tablist" aria-label="اسلایدهای هیرو">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            className={"dot" + (i === current ? " active" : "")}
            role="tab"
            aria-selected={i === current}
            aria-label={`اسلاید ${(i + 1).toLocaleString("fa-IR")}`}
            onClick={() => {
              setCurrent(i);
              start();
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}
