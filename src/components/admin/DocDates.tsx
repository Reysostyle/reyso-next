"use client";

import { useDocumentInfo } from "@payloadcms/ui";

const jalali = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Replaces Payload's Gregorian created/updated dates with Persian (Jalali) ones.
export default function DocDates() {
  const { savedDocumentData } = useDocumentInfo();
  const updatedAt = savedDocumentData?.updatedAt as string | undefined;
  const createdAt = savedDocumentData?.createdAt as string | undefined;
  if (!updatedAt && !createdAt) return null;
  return (
    <div className="reyso-doc-dates">
      {updatedAt && (
        <span>
          آخرین تغییر: <b>{jalali.format(new Date(updatedAt))}</b>
        </span>
      )}
      {createdAt && (
        <span>
          ایجاد: <b>{jalali.format(new Date(createdAt))}</b>
        </span>
      )}
    </div>
  );
}
