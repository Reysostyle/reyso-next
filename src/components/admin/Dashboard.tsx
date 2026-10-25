import Link from "next/link";
import type { Payload } from "payload";
import { formatToman, toPersianDigits } from "@/lib/format";
import { type Ranked, type SalesReport, salesReport } from "@/lib/server/reports";
import { ORDER_STATUSES } from "@/payload/collections/Orders";

const day = new Intl.DateTimeFormat("fa-IR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const short = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const RANGES = [7, 30, 90];

/** 12,500,000 -> "۱۲٫۵ میلیون" for chart labels. */
function compactToman(n: number): string {
  if (n >= 1_000_000)
    return toPersianDigits(String(Math.round(n / 100_000) / 10).replace(".", "٫")) + " میلیون";
  if (n >= 1_000) return toPersianDigits(Math.round(n / 1_000)) + " هزار";
  return toPersianDigits(n);
}

// Shown at the top of the admin dashboard, above the list of sections.
export default async function Dashboard({
  payload,
  searchParams,
}: {
  payload: Payload;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const requested = Number(searchParams?.range);
  const days = RANGES.includes(requested) ? requested : 30;

  const [report, recentOrders, published, hidden] = await Promise.all([
    salesReport(payload, days),
    payload.find({
      collection: "orders",
      where: { status: { not_equals: "pending_payment" } },
      sort: "-createdAt",
      limit: 6,
      depth: 0,
    }),
    payload.count({ collection: "products", where: { published: { equals: true } } }),
    payload.count({ collection: "products", where: { published: { not_equals: true } } }),
  ]);

  return (
    <section className="reyso-dash">
      <header className="reyso-dash__hello">
        <div>
          <h2>سلام، خوش آمدید</h2>
          <p>{day.format(new Date())}</p>
        </div>
        <div className="reyso-dash__actions">
          <Link className="reyso-btn reyso-btn--primary" href="/admin/collections/orders">
            سفارش‌ها
          </Link>
          <Link className="reyso-btn" href="/admin/collections/products/create">
            + افزودن محصول
          </Link>
          <a className="reyso-btn" href="/" target="_blank" rel="noreferrer">
            مشاهده سایت ↗
          </a>
        </div>
      </header>

      <div className="reyso-dash__stats">
        <Stat
          value={formatToman(report.todayRevenue)}
          label={`فروش امروز (${toPersianDigits(report.todayOrders)} سفارش)`}
        />
        <Stat
          value={toPersianDigits(report.toHandle)}
          label="سفارش در دست انجام"
          href="/admin/collections/orders?where[status][in]=registered,sewing,ready"
        />
        <Stat
          value={`${toPersianDigits(published.totalDocs)}`}
          label={`محصول در سایت${hidden.totalDocs ? ` · ${toPersianDigits(hidden.totalDocs)} پنهان` : ""}`}
          href="/admin/collections/products"
        />
      </div>

      <div className="reyso-panel">
        <div className="reyso-panel__head">
          <h3>گزارش فروش</h3>
          <nav className="reyso-range" aria-label="بازه گزارش">
            {RANGES.map((r) => (
              <Link key={r} href={`/admin?range=${r}`} className={r === days ? "is-active" : ""}>
                {toPersianDigits(r)} روز
              </Link>
            ))}
          </nav>
        </div>
        {report.orders === 0 ? (
          <p className="reyso-empty">
            در {toPersianDigits(days)} روز گذشته سفارش پرداخت‌شده‌ای نبوده. گزارش‌ها بعد از اولین سفارش پر
            می‌شن.
          </p>
        ) : (
          <SalesBody report={report} />
        )}
      </div>

      <div className="reyso-dash__recent">
        <h3>آخرین سفارش‌ها</h3>
        {recentOrders.docs.length === 0 ? (
          <p className="reyso-muted">هنوز سفارشی ثبت نشده.</p>
        ) : (
          <ul>
            {recentOrders.docs.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/collections/orders/${o.id}`}>
                  <span className="reyso-dash__code" dir="ltr">
                    {o.orderNumber}
                  </span>
                  <span className="reyso-dash__name">{o.customerName}</span>
                  <span className="reyso-price">{formatToman(o.total)}</span>
                  <span className={`reyso-badge reyso-status--${o.status}`}>
                    {ORDER_STATUSES.find((s) => s.value === o.status)?.label}
                  </span>
                  <span className="reyso-muted">{short.format(new Date(o.createdAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const body = (
    <>
      <b>{value}</b>
      <span>{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="reyso-stat">
      {body}
    </Link>
  ) : (
    <div className="reyso-stat">{body}</div>
  );
}

function SalesBody({ report }: { report: SalesReport }) {
  const max = Math.max(...report.daily.map((d) => d.revenue), 1);
  const labelEvery = Math.ceil(report.daily.length / 7);
  return (
    <>
      <div className="reyso-kpis">
        <div>
          <b>{formatToman(report.revenue)}</b>
          <span>فروش {toPersianDigits(report.days)} روز</span>
        </div>
        <div>
          <b>{toPersianDigits(report.orders)}</b>
          <span>سفارش</span>
        </div>
        <div>
          <b>{formatToman(report.averageOrder)}</b>
          <span>میانگین هر سفارش</span>
        </div>
        <div>
          <b>
            {toPersianDigits(report.newCustomers)} / {toPersianDigits(report.returningCustomers)}
          </b>
          <span>مشتری جدید / خرید دوباره</span>
        </div>
        {report.awaitingPayment > 0 && (
          <div>
            <b>{toPersianDigits(report.awaitingPayment)}</b>
            <span>سفارش رها‌شده در پرداخت</span>
          </div>
        )}
      </div>

      <figure className="reyso-chart" aria-label="فروش روزانه">
        <figcaption>فروش روزانه (تومان)</figcaption>
        <div className="reyso-chart__plot">
          <span className="reyso-chart__max">{compactToman(max)}</span>
          <div className="reyso-chart__bars" dir="ltr">
            {report.daily.map((d) => (
              <div
                key={d.key}
                className="reyso-chart__bar"
                data-tip={`${d.label}: ${formatToman(d.revenue)} · ${toPersianDigits(d.orders)} سفارش`}
                tabIndex={0}
              >
                <span style={{ height: `${(d.revenue / max) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="reyso-chart__axis" dir="ltr">
          {report.daily.map((d, i) => (
            <span key={d.key}>{(report.daily.length - 1 - i) % labelEvery === 0 ? d.label : ""}</span>
          ))}
        </div>
        <details className="reyso-chart__table">
          <summary>نمایش جدول</summary>
          <table>
            <thead>
              <tr>
                <th>روز</th>
                <th>سفارش</th>
                <th>فروش</th>
              </tr>
            </thead>
            <tbody>
              {report.daily
                .filter((d) => d.orders)
                .map((d) => (
                  <tr key={d.key}>
                    <td>{d.label}</td>
                    <td>{toPersianDigits(d.orders)}</td>
                    <td>{formatToman(d.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      </figure>

      <div className="reyso-grid">
        <RankList title="پرفروش‌ترین محصولات" unit="عدد" rows={report.topProducts} />
        <RankList title="سایزهای پرتقاضا" unit="عدد" rows={report.sizes} />
        <RankList title="رنگ‌های پرتقاضا" unit="عدد" rows={report.colors} />
        <RankList title="شهرها" unit="سفارش" rows={report.cities} />
      </div>

      {report.discounts.length > 0 && (
        <div className="reyso-discounts">
          <h4>کدهای تخفیف</h4>
          <table>
            <thead>
              <tr>
                <th>کد</th>
                <th>سفارش</th>
                <th>جمع تخفیف</th>
              </tr>
            </thead>
            <tbody>
              {report.discounts.map((d) => (
                <tr key={d.code}>
                  <td dir="ltr">{d.code}</td>
                  <td>{toPersianDigits(d.orders)}</td>
                  <td>{formatToman(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function RankList({ title, unit, rows }: { title: string; unit: string; rows: Ranked }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="reyso-rank">
      <h4>{title}</h4>
      <ul>
        {rows.map((r) => (
          <li key={r.label}>
            <span className="reyso-rank__label">{toPersianDigits(r.label)}</span>
            <span className="reyso-rank__track">
              <span style={{ width: `${(r.value / max) * 100}%` }} />
            </span>
            <span className="reyso-rank__value">
              {toPersianDigits(r.value)} {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
