import { ShopView } from "@/components/shop/ShopView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("shop", "/shop");

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const { category } = await searchParams;
  const initial = typeof category === "string" ? category : undefined;
  // key: following another ?category= link resets the filters.
  return <ShopView key={initial ?? ""} initialCategory={initial} />;
}
