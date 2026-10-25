import { Suspense } from "react";
import { ShopFromQuery, ShopView } from "@/components/shop/ShopView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("shop", "/shop");

// ?category= is read in the browser so the page can be served as static
// HTML; until then it renders unfiltered.
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopView />}>
      <ShopFromQuery />
    </Suspense>
  );
}
