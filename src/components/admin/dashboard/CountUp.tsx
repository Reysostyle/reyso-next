"use client";

import { useEffect, useRef, useState } from "react";
import { formatToman, toPersianDigits } from "@/lib/format";

const FORMAT = {
  toman: formatToman,
  number: (n: number) => toPersianDigits(n.toLocaleString("en-US").replace(/,/g, "٬")),
};

/** A number that counts up from zero when the dashboard opens. */
export function CountUp({ value, kind = "number" }: { value: number; kind?: keyof typeof FORMAT }) {
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !value) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    const duration = 900;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(t < 1 ? Math.round(value * eased) : value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{FORMAT[kind](shown)}</>;
}
