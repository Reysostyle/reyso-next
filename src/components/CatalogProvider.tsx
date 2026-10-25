"use client";

import { createContext, useContext } from "react";
import type { Catalog } from "@/lib/catalog";
import type { Product } from "@/lib/products";

// The catalogue is loaded once on the server (layout) and shared with the
// client components that look products up by id: cart toast, quick view,
// search, wishlist, recently viewed.

const CatalogContext = createContext<Catalog>({
  products: [],
  collections: [],
  lessons: [],
  featuredIds: [],
});

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  return useContext(CatalogContext);
}

export function useProductLookup(): (id: string | null | undefined) => Product | null {
  const { products } = useCatalog();
  return (id) => products.find((p) => p.id === id) ?? null;
}
