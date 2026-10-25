"use client";

import { useEffect } from "react";
import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { useProductLookup } from "@/components/CatalogProvider";
import type { Product } from "@/lib/products";
import { ProductCarousel } from "./ProductCarousel";

const recentStore = createLocalStore<string[]>("reyso_recently_viewed", []);
const MAX = 8;

export function trackProductView(id: string) {
  recentStore.set([id, ...recentStore.get().filter((x) => x !== id)].slice(0, MAX));
}

export function useTrackProductView(id: string) {
  useEffect(() => trackProductView(id), [id]);
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useLocalStore(recentStore);
  const getProductById = useProductLookup();
  const products = ids
    .filter((id) => id !== excludeId)
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== null);

  if (products.length === 0) return null;

  return (
    <section className="products" id="recently-viewed-section">
      <div className="container">
        <div className="products-head">
          <p className="eyebrow">
            <span className="eyebrow-line"></span>
            اخیراً دیده‌شده
          </p>
          <h2>محصولاتی که اخیراً دیدی</h2>
        </div>
        <ProductCarousel
          products={products}
          autoMs={3500}
          arrowClassPrefix
          ids={{
            prev: "recent-prev",
            next: "recent-next",
            viewport: "recent-viewport",
            grid: "recently-viewed-grid",
          }}
        />
      </div>
    </section>
  );
}
