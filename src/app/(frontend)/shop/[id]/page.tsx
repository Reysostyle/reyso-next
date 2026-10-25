import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getProduct } from "@/lib/catalog";
import { ProductDetails } from "@/components/shop/ProductDetails";

export async function generateStaticParams() {
  return (await getCatalog()).products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[id]">): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: "/shop/" + product.id },
    openGraph: {
      type: "website",
      title: "ReySo | " + product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[id]">) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // No aggregateRating: the ratings are still placeholder numbers, and
  // Google treats made-up review markup as spam.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => new URL(src, base).href),
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10, // toman -> rial
      availability:
        product.soldOutSizes.length >= product.sizes.length
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetails product={product} />
    </>
  );
}
