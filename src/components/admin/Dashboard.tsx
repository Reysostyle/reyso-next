/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Payload } from "payload";
import { formatToman, toPersianDigits } from "@/lib/format";

const day = new Intl.DateTimeFormat("fa-IR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const short = new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" });

// Shown at the top of the admin dashboard, above the list of sections.
export default async function Dashboard({ payload }: { payload: Payload }) {
  const [published, hidden, categories, soldOut, recent] = await Promise.all([
    payload.count({ collection: "products", where: { published: { equals: true } } }),
    payload.count({ collection: "products", where: { published: { not_equals: true } } }),
    payload.count({ collection: "categories" }),
    payload.count({ collection: "products", where: { soldOutSizes: { exists: true } } }),
    payload.find({ collection: "products", sort: "-updatedAt", limit: 5, depth: 1 }),
  ]);

  const stats = [
    {
      label: "محصول در سایت",
      value: published.totalDocs,
      href: "/admin/collections/products?where[published][equals]=true",
    },
    {
      label: "محصول پنهان",
      value: hidden.totalDocs,
      href: "/admin/collections/products?where[published][not_equals]=true",
    },
    { label: "کالکشن", value: categories.totalDocs, href: "/admin/collections/categories" },
    {
      label: "محصول با سایز ناموجود",
      value: soldOut.totalDocs,
      href: "/admin/collections/products?where[soldOutSizes][exists]=true",
    },
  ];

  return (
    <section className="reyso-dash">
      <header className="reyso-dash__hello">
        <div>
          <h2>سلام، خوش آمدید</h2>
          <p>{day.format(new Date())}</p>
        </div>
        <div className="reyso-dash__actions">
          <Link className="reyso-btn reyso-btn--primary" href="/admin/collections/products/create">
            + افزودن محصول
          </Link>
          <Link className="reyso-btn" href="/admin/globals/home">
            محصولات صفحه اصلی
          </Link>
          <a className="reyso-btn" href="/" target="_blank" rel="noreferrer">
            مشاهده سایت ↗
          </a>
        </div>
      </header>

      <div className="reyso-dash__stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="reyso-stat">
            <b>{toPersianDigits(s.value)}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="reyso-dash__recent">
        <h3>آخرین تغییرات محصولات</h3>
        <ul>
          {recent.docs.map((p) => {
            const img = p.images?.[0];
            const url = typeof img === "object" ? img?.url : undefined;
            return (
              <li key={p.id}>
                <Link href={`/admin/collections/products/${p.id}`}>
                  {url ? <img src={url} alt="" /> : <span className="reyso-thumb--empty" />}
                  <span className="reyso-dash__name">{p.name}</span>
                  <span className="reyso-price">{formatToman(p.price)}</span>
                  {!p.published && <span className="reyso-badge reyso-badge--off">پنهان</span>}
                  <span className="reyso-muted">{short.format(new Date(p.updatedAt))}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
