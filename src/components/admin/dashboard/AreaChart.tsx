"use client";

import { useRef, useState } from "react";
import { formatToman, toPersianDigits } from "@/lib/format";

type Day = { key: string; label: string; revenue: number; orders: number };

const W = 720;
const H = 220;

/** 12,500,000 -> "۱۲٫۵ م" for the axis. */
function compact(n: number): string {
  if (n >= 1_000_000)
    return toPersianDigits(String(Math.round(n / 100_000) / 10).replace(".", "٫")) + " میلیون";
  if (n >= 1_000) return toPersianDigits(Math.round(n / 1_000)) + " هزار";
  return toPersianDigits(n);
}

/** Smooth path through the points (Catmull-Rom as cubic Béziers). */
function smooth(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    // Keep the curve from dipping below the baseline between two quiet days.
    d += ` C${c1[0]},${Math.min(c1[1], H)} ${c2[0]},${Math.min(c2[1], H)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Daily sales as an area chart with a hover crosshair. Time runs left to
// right like the rest of the numbers on the dashboard.
export function AreaChart({ daily }: { daily: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  const max = Math.max(...daily.map((d) => d.revenue), 1);
  const top = max * 1.1;
  const step = daily.length > 1 ? W / (daily.length - 1) : W;
  const points = daily.map((d, i): [number, number] => [i * step, H - (d.revenue / top) * H]);
  const line = smooth(points);
  const area = `${line} L${W},${H} L0,${H} Z`;
  const labelEvery = Math.ceil(daily.length / 7);
  const active = hover === null ? null : daily[hover];

  function onMove(e: React.PointerEvent) {
    const box = plot.current!.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - box.left, 0), box.width);
    setHover(Math.round((x / box.width) * (daily.length - 1)));
  }

  return (
    <div className="rd-area" dir="ltr">
      <div className="rd-area__grid">
        {[1, 0.5, 0].map((f) => (
          <span key={f} style={{ top: `${(1 - f / 1.1) * 100}%` }}>
            <em>{f ? compact(max * f) : "۰"}</em>
          </span>
        ))}
      </div>
      <div
        className="rd-area__plot"
        ref={plot}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="نمودار فروش روزانه"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="rd-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c4436" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#1c4436" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="rd-area__fill" d={area} fill="url(#rd-area-fill)" />
          <path
            className="rd-area__line"
            d={line}
            fill="none"
            stroke="#1c4436"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
          />
        </svg>
        {active && hover !== null && (
          <>
            <span
              className="rd-area__cross"
              style={{ left: `${(hover / Math.max(daily.length - 1, 1)) * 100}%` }}
            />
            <span
              className="rd-area__dot"
              style={{
                left: `${(hover / Math.max(daily.length - 1, 1)) * 100}%`,
                top: `${(1 - active.revenue / top) * 100}%`,
              }}
            />
            <div
              className={"rd-area__tip" + (hover > daily.length / 2 ? " is-left" : "")}
              style={{ left: `${(hover / Math.max(daily.length - 1, 1)) * 100}%` }}
              dir="rtl"
            >
              <b>{active.label}</b>
              <span>{formatToman(active.revenue)}</span>
              <span>{toPersianDigits(active.orders)} سفارش</span>
            </div>
          </>
        )}
      </div>
      <div className="rd-area__axis">
        {daily.map((d, i) => (
          <span key={d.key}>{(daily.length - 1 - i) % labelEvery === 0 ? d.label : ""}</span>
        ))}
      </div>
    </div>
  );
}
