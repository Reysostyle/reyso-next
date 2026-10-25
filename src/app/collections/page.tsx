import Link from "next/link";
import { COLLECTIONS, collectionHref } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

/* eslint-disable @next/next/no-img-element */

export const metadata = pageMetadata("collections", "/collections");

// Tile order and images as on the old collections page.
const TILES = [
  ["مانتو", "/images/manto.jpg"],
  ["پالتو", "/images/hero5.jpg"],
  ["کت و شلوار", "/images/hero3.jpg"],
  ["شومیز", "/images/hero4.jpg"],
  ["پیراهن", "/images/hero2.jpg"],
  ["ست", "/images/set-4.jpg"],
] as const;

export default function CollectionsPage() {
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
          {TILES.map(([slug, image]) => {
            const name = COLLECTIONS.find((c) => c.slug === slug)?.name ?? slug;
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
