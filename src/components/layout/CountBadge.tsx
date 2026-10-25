"use client";

import { useEffect, useRef, useState } from "react";

// Nav counter that replays a small bump animation when it goes up.
// Not rendered at zero (the old markup relied on the hidden attribute,
// which the stylesheet overrode, so "0" always showed).
export function CountBadge({ className, count }: { className: string; count: number }) {
  const last = useRef<number | null>(null);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (last.current !== null && count > last.current) setBumpKey((k) => k + 1);
    last.current = count;
  }, [count]);

  if (count === 0) return null;
  return (
    <span key={bumpKey} className={className + (bumpKey ? " is-bumping" : "")}>
      {count.toLocaleString("en-US")}
    </span>
  );
}
