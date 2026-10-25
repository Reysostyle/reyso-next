import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { collectionHref } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

/* eslint-disable @next/next/no-img-element */

export const metadata = pageMetadata("collections", "/collections");

export default async function CollectionsPage() {
  const { collections } = await getCatalog();
  return (
    <section className="col-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <span>کالکشن‌ها</span>
        </p>
        <div className="col-head">
          <p className="eyebrow">
            <span className="eyebrow-line"></span> دسته‌بندی‌ها
          </p>
        </div>
        <div className="col-grid">
          {collections.map(({ slug, image, name }) => {
            return (
              <Link key={slug} href={collectionHref(slug)} className="col-tile">
                <img loading="lazy" src={image} alt={"کالکشن " + name} />
                <div className="col-tile-overlay">
                  <span className="col-tile-name">{name}</span>
                  <span className="col-tile-arrow">
                    <i className="ri-arrow-left-line"></i>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
