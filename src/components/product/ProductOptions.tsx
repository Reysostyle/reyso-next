"use client";

import type { Product } from "@/lib/products";

// Size / color / quantity pickers shared by the product page and quick view.

export function firstAvailableSize(product: Product): string {
  return product.sizes.find((s) => !product.soldOutSizes.includes(s)) ?? product.sizes[0];
}

export function SizeOptions({
  product,
  value,
  onChange,
}: {
  product: Product;
  value: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="pd-options">
      {product.sizes.map((size) => {
        const soldOut = product.soldOutSizes.includes(size);
        return (
          <button
            key={size}
            type="button"
            className={"pd-size-btn" + (size === value ? " active" : "") + (soldOut ? " sold-out" : "")}
            disabled={soldOut}
            title={soldOut ? "این سایز ناموجود است" : undefined}
            onClick={() => onChange(size)}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

export function ColorOptions({
  product,
  value,
  onChange,
}: {
  product: Product;
  value: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="pd-options">
      {product.colors.map((color, i) => (
        <button
          key={color.name}
          type="button"
          className={"pd-color-btn" + (i === value ? " active" : "")}
          onClick={() => onChange(i)}
        >
          <span className="dot" style={{ background: color.hex }}></span> {color.name}
        </button>
      ))}
    </div>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (qty: number) => void }) {
  return (
    <div className="pd-qty">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span>{value.toLocaleString("fa-IR")}</span>
      <button type="button" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

export function DiscountBadge({ product }: { product: Product }) {
  if (!product.oldPrice) return null;
  const percent = Math.round((1 - product.price / product.oldPrice) * 100);
  return <span className="badge">{percent.toLocaleString("fa-IR")}٪ تخفیف</span>;
}
