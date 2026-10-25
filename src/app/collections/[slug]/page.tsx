import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS, PRODUCTS, getCollectionBySlug } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

const FALLBACK_DESCRIPTION = "محصولات این کالکشن از ReySo — دوخت اختصاصی با پارچه‌های منتخب و طراحی بی‌زمان.";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

async function resolve(params: PageProps<"/collections/[slug]">["params"]) {
  const slug = decodeURIComponent((await params).slug);
  const collection = getCollectionBySlug(slug);
  return { slug, collection, name: collection?.name ?? (slug || "کالکشن") };
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug, collection, name } = await resolve(params);
  const description = collection?.description ?? FALLBACK_DESCRIPTION;
  return {
    title: name,
    description,
    alternates: { canonical: "/collections/" + encodeURIComponent(slug) },
    openGraph: { title: "ReySo | " + name, description },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug, name } = await resolve(params);
  const matches = PRODUCTS.filter((p) => p.category === slug);

  return (
    <>
      <section className="shop-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <Link href="/collections">کالکشن‌ها</Link> /{" "}
            <span id="cold-crumb">{name}</span>
          </p>
          <div className="cold-toolbar">
            <h2 id="cold-toolbar-title">
              محصولات {name} ({matches.length.toLocaleString("fa-IR")})
            </h2>
            <Link href={"/shop?category=" + encodeURIComponent(slug)} id="cold-shop-link">
              مشاهده همه محصولات در فروشگاه <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="product-grid" id="cold-grid">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <p className="shop-empty" id="cold-empty" hidden={matches.length > 0}>
            هنوز محصولی در این کالکشن ثبت نشده — به‌زودی اضافه می‌شه.
          </p>
        </div>
      </section>
      <RecentlyViewed />
    </>
  );
}
