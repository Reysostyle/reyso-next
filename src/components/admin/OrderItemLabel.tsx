"use client";

import { useRowLabel } from "@payloadcms/ui";
import { toPersianDigits } from "@/lib/format";

type Item = { name?: string; size?: string; color?: string; qty?: number };

// "مانتو کرم ابریشمی · سایز ۳۸ · کرم · ×۲" instead of "قلم ۰۱".
export default function OrderItemLabel() {
  const { data } = useRowLabel<Item>();
  if (!data?.name) return null;
  return (
    <span>
      {data.name} · سایز {toPersianDigits(data.size ?? "")} · {data.color} · ×{toPersianDigits(data.qty ?? 1)}
    </span>
  );
}
