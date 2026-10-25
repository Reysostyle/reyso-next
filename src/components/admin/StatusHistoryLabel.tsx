"use client";

import { useRowLabel } from "@payloadcms/ui";
import { ORDER_STATUSES } from "@/payload/order-statuses";

const jalali = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// "ارسال شد · ۵ آبان، ۱۴:۲۰" instead of "تغییر ۰۱".
export default function StatusHistoryLabel() {
  const { data } = useRowLabel<{ status?: string; at?: string }>();
  if (!data?.status) return null;
  const label = ORDER_STATUSES.find((s) => s.value === data.status)?.label ?? data.status;
  return (
    <span>
      {label}
      {data.at && <span className="reyso-muted"> · {jalali.format(new Date(data.at))}</span>}
    </span>
  );
}
