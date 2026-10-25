"use client";

import { useField } from "@payloadcms/ui";

const jalali = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Read-only date in the Persian calendar (Payload's date picker is Gregorian).
export default function JalaliDateField({ path, field }: { path: string; field: { label?: unknown } }) {
  const { value } = useField<string>({ path });
  return (
    <div className="field-type reyso-readonly">
      <label className="field-label">{typeof field.label === "string" ? field.label : ""}</label>
      <div>{value ? jalali.format(new Date(value)) : "—"}</div>
    </div>
  );
}
