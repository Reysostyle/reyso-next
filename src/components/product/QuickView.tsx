"use client";

import Link from "next/link";
import { useState } from "react";
import { useUi } from "@/components/UiProvider";
import { addToCart } from "@/lib/cart";
import { type Product, formatToman, getProductById, productHref } from "@/lib/products";
import { ColorOptions, DiscountBadge, QtyStepper, SizeOptions, firstAvailableSize } from "./ProductOptions";

/* eslint-disable @next/next/no-img-element */

// Preview a product (image, price, size, color, quantity) without
// leaving the grid. Reuses the product page's pd-* styles.
export function QuickView() {
  const { quickViewId, openQuickView } = useUi();
  // Keep the last product mounted while the modal fades out.
  const [shownId, setShownId] = useState(quickViewId);
  if (quickViewId && quickViewId !== shownId) setShownId(quickViewId);
  const product = getProductById(shownId);
  const close = () => openQuickView(null);

  return (
    <div className={"qv-modal" + (quickViewId && product ? " open" : "")} id="qv-modal">
      <div className="qv-backdrop" onClick={close}></div>
      <div className="qv-box">
        <button type="button" className="qv-close" aria-label="بستن" onClick={close}>
          <i className="ri-close-line"></i>
        </button>
        {product && (
          <QuickViewContent key={product.id + String(quickViewId)} product={product} onDone={close} />
        )}
      </div>
    </div>
  );
}

function QuickViewContent({ product, onDone }: { product: Product; onDone: () => void }) {
  const { showCartToast } = useUi();
  const [size, setSize] = useState(() => firstAvailableSize(product));
  const [colorIndex, setColorIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const color = product.colors[colorIndex];

  return (
    <div className="qv-content">
      <div className="qv-media">
        <img id="qv-image" src={color.image} alt={product.name} />
      </div>
      <div className="qv-info">
        <h3 id="qv-name">{product.name}</h3>
        <div className="pd-price">
          <span className="now">{formatToman(product.price)}</span>
          {product.oldPrice && <span className="was">{formatToman(product.oldPrice)}</span>}
          <DiscountBadge product={product} />
        </div>
        <p className="qv-desc">{product.description}</p>
        <div className="pd-block">
          <p>سایز</p>
          <SizeOptions product={product} value={size} onChange={setSize} />
        </div>
        <div className="pd-block">
          <p>رنگ</p>
          <ColorOptions product={product} value={colorIndex} onChange={setColorIndex} />
        </div>
        <div className="pd-block">
          <p>تعداد</p>
          <QtyStepper value={qty} onChange={setQty} />
        </div>
        <div className="pd-cta">
          <button
            type="button"
            className="pd-add-btn"
            onClick={() => {
              const item = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: color.image,
                size,
                color: color.name,
                qty,
              };
              addToCart(item);
              showCartToast(item);
              onDone();
            }}
          >
            افزودن به سبد خرید
          </button>
        </div>
        <Link href={productHref(product.id)} className="qv-full-link" onClick={onDone}>
          مشاهده کامل محصول <i className="ri-arrow-left-line"></i>
        </Link>
      </div>
    </div>
  );
}
