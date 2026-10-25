"use client";

import { type Product, getProductById } from "@/lib/products";
import { ProductCarousel } from "@/components/product/ProductCarousel";

// Order here is the order they render in the homepage row.
const FEATURED_PRODUCT_IDS = [
  "manteau-abrisham",
  "pirahan-majlesi",
  "kot-shalvar-beige",
  "shomiz-abrisham-sabz",
  "palto-pashmi-zeytooni",
  "manteau-linen-khaki",
];

export function FeaturedProducts() {
  const products = FEATURED_PRODUCT_IDS.map(getProductById).filter((p): p is Product => p !== null);
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
