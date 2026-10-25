"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCTS, getCollectionBySlug } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

const MAX_PRICE = 5000000;
type Sort = "newest" | "popular" | "price-asc" | "price-desc";

const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];
const SIZES = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];
const COLORS = (() => {
  const seen = new Map<string, string>();
  PRODUCTS.forEach((p) => p.colors.forEach((c) => seen.has(c.name) || seen.set(c.name, c.hex)));
  return [...seen.entries()];
})();

const categoryLabel = (c: string) => getCollectionBySlug(c)?.name ?? c;

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ShopView({ initialCategory }: { initialCategory?: string }) {
  const [categories, setCategories] = useState(
    () => new Set(initialCategory && CATEGORIES.includes(initialCategory) ? [initialCategory] : []),
  );
  const [sizes, setSizes] = useState(new Set<string>());
  const [colors, setColors] = useState(new Set<string>());
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const products = useMemo(() => {
    const filtered = PRODUCTS.filter((p) => {
      if (categories.size && !categories.has(p.category)) return false;
      if (sizes.size && !p.sizes.some((s) => sizes.has(s))) return false;
      if (colors.size && !p.colors.some((c) => colors.has(c.name))) return false;
      return p.price <= maxPrice;
    });
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "popular") sorted.sort((a, b) => b.popularity - a.popularity);
    else sorted.sort((a, b) => b.dateAdded - a.dateAdded);
    return sorted;
  }, [categories, sizes, colors, maxPrice, sort]);

  const chips: { label: string; remove: () => void }[] = [
    ...[...categories].map((c) => ({
      label: categoryLabel(c),
      remove: () => setCategories((s) => toggle(s, c)),
    })),
    ...[...sizes].map((s) => ({ label: "سایز " + s, remove: () => setSizes((x) => toggle(x, s)) })),
    ...[...colors].map((c) => ({ label: c, remove: () => setColors((x) => toggle(x, c)) })),
    ...(maxPrice < MAX_PRICE
      ? [{ label: "تا " + maxPrice.toLocaleString("fa-IR") + " تومان", remove: () => setMaxPrice(MAX_PRICE) }]
      : []),
  ];

  function clearAll() {
    setCategories(new Set());
    setSizes(new Set());
    setColors(new Set());
    setMaxPrice(MAX_PRICE);
  }

  return (
    <>
      <section className="shop-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <span>محصولات</span>
          </p>
          <div className="shop-layout">
            <aside className={"shop-filters" + (filtersOpen ? " open" : "")} id="shop-filters">
              <div className="shop-filters-head">
                <h4>فیلترها</h4>
                <button className="filters-clear" id="filters-clear" onClick={clearAll}>
                  پاک کردن
                </button>
                <button
                  className="shop-filters-close"
                  id="shop-filters-close"
                  aria-label="بستن فیلترها"
                  onClick={() => setFiltersOpen(false)}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="filter-group">
                <p className="filter-title">دسته‌بندی</p>
                <div className="filter-check-list" id="filter-categories">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="filter-check">
                      <input
                        type="checkbox"
                        value={cat}
                        checked={categories.has(cat)}
                        onChange={() => setCategories((s) => toggle(s, cat))}
                      />
                      <span>{categoryLabel(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <p className="filter-title">محدوده قیمت</p>
                <input
                  type="range"
                  className="filter-range"
                  id="filter-price"
                  min="1000000"
                  max={MAX_PRICE}
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="filter-range-labels">
                  <span>از ۱٬۰۰۰٬۰۰۰</span>
                  <span id="filter-price-value">تا {maxPrice.toLocaleString("fa-IR")}</span>
                </div>
              </div>
              <div className="filter-group">
                <p className="filter-title">سایز</p>
                <div className="filter-pills" id="filter-sizes">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={sizes.has(size) ? "active" : undefined}
                      onClick={() => setSizes((s) => toggle(s, size))}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <p className="filter-title">رنگ</p>
                <div className="filter-swatches" id="filter-colors">
                  {COLORS.map(([name, hex]) => (
                    <button
                      key={name}
                      type="button"
                      className={"filter-swatch" + (colors.has(name) ? " active" : "")}
                      title={name}
                      aria-label={name}
                      style={{ "--swatch": hex } as React.CSSProperties}
                      onClick={() => setColors((s) => toggle(s, name))}
                    ></button>
                  ))}
                </div>
              </div>
            </aside>
            <div className="shop-main">
              <div className="shop-toolbar">
                <p className="shop-count" id="shop-count">
                  {products.length.toLocaleString("fa-IR")} محصول
                </p>
                <div className="shop-toolbar-actions">
                  <div className="shop-view-toggle">
                    <button
                      className={view === "grid" ? "active" : undefined}
                      aria-label="نمایش شبکه‌ای"
                      onClick={() => setView("grid")}
                    >
                      <i className="ri-grid-fill"></i>
                    </button>
                    <button
                      className={view === "list" ? "active" : undefined}
                      aria-label="نمایش لیستی"
                      onClick={() => setView("list")}
                    >
                      <i className="ri-list-check-2"></i>
                    </button>
                  </div>
                  <div className="shop-sort-wrap">
                    <select
                      className="shop-sort"
                      id="shop-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as Sort)}
                    >
                      <option value="newest">جدیدترین</option>
                      <option value="popular">پرطرفدارترین</option>
                      <option value="price-asc">ارزان‌ترین</option>
                      <option value="price-desc">گران‌ترین</option>
                    </select>
                    <i className="ri-arrow-down-s-line"></i>
                  </div>
                  <button
                    className="mobile-filters-btn"
                    id="mobile-filters-btn"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <i className="ri-equalizer-line"></i> فیلترها
                  </button>
                </div>
              </div>
              <div className="active-filters" id="active-filters">
                {chips.map((chip) => (
                  <button key={chip.label} type="button" className="filter-chip" onClick={chip.remove}>
                    {chip.label} <i className="ri-close-line"></i>
                  </button>
                ))}
              </div>
              <div
                className={"product-grid shop-grid" + (view === "list" ? " shop-grid-list" : "")}
                id="shop-grid"
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <p className="shop-empty" id="shop-empty" hidden={products.length > 0}>
                محصولی با این فیلترها پیدا نشد. فیلترها رو تغییر بده یا پاک کن.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div
        className={"shop-filters-backdrop" + (filtersOpen ? " open" : "")}
        id="shop-filters-backdrop"
        onClick={() => setFiltersOpen(false)}
      ></div>
      <RecentlyViewed />
    </>
  );
}
