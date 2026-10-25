"use client";

import { useField } from "@payloadcms/ui";

// The customer's saved products, as links to the storefront.
export default function WishlistField({ path, field }: { path: string; field: { label?: unknown } }) {
  const { value } = useField<string[]>({ path });
  const ids = Array.isArray(value) ? value : [];
  return (
    <div className="field-type reyso-readonly">
      <label className="field-label">{typeof field.label === "string" ? field.label : ""}</label>
      {ids.length ? (
        <div className="reyso-chips">
          {ids.map((id) => (
            <a key={id} href={`/shop/${id}`} target="_blank" rel="noreferrer">
              {id}
            </a>
          ))}
        </div>
      ) : (
        <div className="reyso-muted">چیزی ذخیره نکرده</div>
      )}
    </div>
  );
}
