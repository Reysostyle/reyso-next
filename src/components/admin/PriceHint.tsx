"use client";

import { useField } from "@payloadcms/ui";
import { formatToman } from "@/lib/format";

// Shown under a price input so large numbers are easy to check while typing.
export default function PriceHint({ path }: { path: string }) {
  const { value } = useField<number>({ path });
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return <div className="reyso-price-hint">{formatToman(value)}</div>;
}
