"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @next/next/no-img-element */

// Drives --story-progress (0 → 1) on .story-stage as the section
// scrolls through the viewport. Only listens while it's near view.
export function StoryReveal() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let ticking = false;

    function update() {
      const rect = stage!.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      stage!.style.setProperty("--story-progress", progress.toFixed(3));
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          update();
          window.addEventListener("scroll", onScroll, { passive: true });
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    observer.observe(stage);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="story">
      <div className="container">
        <div className="story-stage" ref={stageRef}>
          <div className="story-img story-left">
            <img loading="lazy" src="/images/hero6.jpg" alt="ReySo" />
          </div>
          <div className="story-img story-center">
            <img loading="lazy" src="/images/hero3.jpg" alt="ReySo" />
          </div>
          <div className="story-img story-right">
            <img loading="lazy" src="/images/hero4.jpg" alt="ReySo" />
          </div>
        </div>
      </div>
    </section>
  );
}
