"use client";

import { useCatalog, useProductLookup } from "@/components/CatalogProvider";
import type { Product } from "@/lib/products";
import { ProductCarousel } from "@/components/product/ProductCarousel";

export function FeaturedProducts() {
  // Picked (and ordered) in the admin panel under "صفحه اصلی".
  const { featuredIds } = useCatalog();
  const getProduct = useProductLookup();
  const products = featuredIds.map(getProduct).filter((p): p is Product => p !== null);
  return (
    <ProductCarousel
      products={products}
      autoMs={4000}
      ids={{
        prev: "featured-prev",
        next: "featured-next",
        viewport: "featured-viewport",
        grid: "featured-grid",
      }}
    />
  );
}
