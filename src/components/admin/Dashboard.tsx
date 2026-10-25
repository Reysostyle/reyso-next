import Link from "next/link";
import type { Payload, TypedUser } from "payload";
import { formatToman, toPersianDigits } from "@/lib/format";
import { type Ranked, type SalesReport, salesReport } from "@/lib/server/reports";
import { ORDER_STATUSES } from "@/payload/order-statuses";
import { AreaChart } from "./dashboard/AreaChart";
import { CountUp } from "./dashboard/CountUp";

const TZ = "Asia/Tehran";
const day = new Intl.DateTimeFormat("fa-IR", {
  timeZone: TZ,
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const hourIn = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" });
const ago = new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" });
const RANGES = [7, 30, 90];
const STATUS_LABEL = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s.label]));

function greeting(): string {
  const h = Number(hourIn.format(new Date()));
  if (h < 5) return "شب بخیر";
  if (h < 12) return "صبح بخیر";
  if (h < 17) return "روز بخیر";
  return "عصر بخیر";
}

function timeAgo(iso: string): string {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (minutes > -60) return ago.format(Math.min(minutes, -1), "minute");
  if (minutes > -60 * 24) return ago.format(Math.round(minutes / 60), "hour");
  return ago.format(Math.round(minutes / (60 * 24)), "day");
}

/** Change against the period before, as a rounded percentage. */
function trend(now: number, before: number): number | null {
  if (!before) return null;
  return Math.round(((now - before) / before) * 100);
}

// Shown at the top of the admin dashboard, above the list of sections.
export default async function Dashboard({
  payload,
  searchParams,
  user,
}: {
  payload: Payload;
  searchParams?: Record<string, string | string[] | undefined>;
  user?: TypedUser | null;
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
  const name = user && "name" in user && typeof user.name === "string" ? user.name : "";

  return (
    <section className="rd">
      <header className="rd-hero rd-rise">
        <span className="rd-hero__glow rd-hero__glow--a" aria-hidden="true" />
        <span className="rd-hero__glow rd-hero__glow--b" aria-hidden="true" />
        <div className="rd-hero__text">
          <p className="rd-hero__date">{day.format(new Date())}</p>
          <h2>
            {greeting()}
            {name ? `، ${name}` : ""}
          </h2>
          <p className="rd-hero__today">
            امروز <b>{formatToman(report.todayRevenue)}</b> فروش از{" "}
            <b>{toPersianDigits(report.todayOrders)}</b> سفارش
          </p>
        </div>
        <div className="rd-hero__actions">
          <Link className="rd-btn rd-btn--gold" href="/admin/collections/orders">
            <Icon name="bag" /> سفارش‌ها
          </Link>
          <Link className="rd-btn" href="/admin/collections/products/create">
            <Icon name="plus" /> افزودن محصول
          </Link>
          <a className="rd-btn" href="/" target="_blank" rel="noreferrer">
            <Icon name="external" /> مشاهده سایت
          </a>
        </div>
      </header>

      <div className="rd-kpis">
        <Kpi
          i={0}
          icon="wallet"
          label={`فروش ${toPersianDigits(days)} روز اخیر`}
          value={<CountUp value={report.revenue} kind="toman" />}
          delta={trend(report.revenue, report.previousRevenue)}
          spark={report.daily.map((d) => d.revenue)}
        />
        <Kpi
          i={1}
          icon="bag"
          label="سفارش‌های پرداخت‌شده"
          value={<CountUp value={report.orders} />}
          delta={trend(report.orders, report.previousOrders)}
          spark={report.daily.map((d) => d.orders)}
        />
        <Kpi
          i={2}
          icon="receipt"
          label="میانگین هر سفارش"
          value={<CountUp value={report.averageOrder} kind="toman" />}
          delta={trend(
            report.averageOrder,
            report.previousOrders ? report.previousRevenue / report.previousOrders : 0,
          )}
        />
        <Kpi
          i={3}
          icon="scissors"
          label="سفارش در دست انجام"
          value={<CountUp value={report.toHandle} />}
          href="/admin/collections/orders?where[status][in]=registered,sewing,ready"
          note={
            report.awaitingPayment
              ? `${toPersianDigits(report.awaitingPayment)} سفارش منتظر پرداخت`
              : `${toPersianDigits(published.totalDocs)} محصول در سایت${hidden.totalDocs ? ` · ${toPersianDigits(hidden.totalDocs)} پنهان` : ""}`
          }
        />
      </div>

      <div className="rd-main">
        <div className="rd-card rd-rise" style={{ "--i": 4 } as React.CSSProperties}>
          <div className="rd-card__head">
            <div>
              <h3>روند فروش</h3>
              <p>فروش روزانه به تومان</p>
            </div>
            <nav className="rd-range" aria-label="بازه گزارش">
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/admin?range=${r}`}
                  className={r === days ? "is-active" : ""}
                  scroll={false}
                >
                  {toPersianDigits(r)} روز
                </Link>
              ))}
            </nav>
          </div>
          {report.orders === 0 ? (
            <Empty days={days} />
          ) : (
            <>
              <AreaChart daily={report.daily} />
              <details className="rd-table">
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
            </>
          )}
        </div>

        <div className="rd-side">
          <div className="rd-card rd-rise" style={{ "--i": 5 } as React.CSSProperties}>
            <div className="rd-card__head">
              <div>
                <h3>مسیر سفارش‌ها</h3>
                <p>سفارش‌های باز در هر مرحله</p>
              </div>
            </div>
            <Pipeline report={report} />
          </div>
          <div className="rd-card rd-rise" style={{ "--i": 6 } as React.CSSProperties}>
            <div className="rd-card__head">
              <div>
                <h3>مشتری‌ها</h3>
                <p>خریداران {toPersianDigits(days)} روز اخیر</p>
              </div>
            </div>
            <Donut fresh={report.newCustomers} returning={report.returningCustomers} />
          </div>
        </div>
      </div>

      {report.orders > 0 && (
        <div className="rd-ranks">
          <RankCard i={7} icon="star" title="پرفروش‌ترین محصولات" unit="عدد" rows={report.topProducts} />
          <RankCard i={8} icon="ruler" title="سایزهای پرتقاضا" unit="عدد" rows={report.sizes} />
          <RankCard i={9} icon="palette" title="رنگ‌های پرتقاضا" unit="عدد" rows={report.colors} />
          <RankCard i={10} icon="pin" title="شهرها" unit="سفارش" rows={report.cities} />
        </div>
      )}

      <div className="rd-bottom">
        <div className="rd-card rd-rise" style={{ "--i": 11 } as React.CSSProperties}>
          <div className="rd-card__head">
            <div>
              <h3>آخرین سفارش‌ها</h3>
            </div>
            <Link className="rd-link" href="/admin/collections/orders">
              همه سفارش‌ها ←
            </Link>
          </div>
          {recentOrders.docs.length === 0 ? (
            <p className="rd-muted">هنوز سفارشی ثبت نشده.</p>
          ) : (
            <ul className="rd-orders">
              {recentOrders.docs.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/collections/orders/${o.id}`}>
                    <span className="rd-avatar" aria-hidden="true">
                      {o.customerName.trim().charAt(0)}
                    </span>
                    <span className="rd-orders__who">
                      <b>{o.customerName}</b>
                      <small dir="ltr">{o.orderNumber}</small>
                    </span>
                    <span className="rd-orders__amount">{formatToman(o.total)}</span>
                    <span className={`reyso-badge reyso-status--${o.status}`}>{STATUS_LABEL[o.status]}</span>
                    <span className="rd-muted rd-orders__time">{timeAgo(o.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {report.discounts.length > 0 && (
          <div className="rd-card rd-rise" style={{ "--i": 12 } as React.CSSProperties}>
            <div className="rd-card__head">
              <div>
                <h3>کدهای تخفیف</h3>
                <p>استفاده در {toPersianDigits(days)} روز اخیر</p>
              </div>
            </div>
            <ul className="rd-codes">
              {report.discounts.map((d) => (
                <li key={d.code}>
                  <span className="rd-codes__code" dir="ltr">
                    {d.code}
                  </span>
                  <span>{toPersianDigits(d.orders)} سفارش</span>
                  <span className="rd-muted">{formatToman(d.amount)} تخفیف</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function Empty({ days }: { days: number }) {
  return (
    <div className="rd-empty">
      <Icon name="chart" />
      <p>
        در {toPersianDigits(days)} روز گذشته سفارش پرداخت‌شده‌ای نبوده. نمودارها بعد از اولین سفارش پر
        می‌شوند.
      </p>
    </div>
  );
}

function Kpi({
  i,
  icon,
  label,
  value,
  delta,
  spark,
  href,
  note,
}: {
  i: number;
  icon: IconName;
  label: string;
  value: React.ReactNode;
  delta?: number | null;
  spark?: number[];
  href?: string;
  note?: string;
}) {
  const body = (
    <>
      <div className="rd-kpi__top">
        <span className="rd-kpi__icon">
          <Icon name={icon} />
        </span>
        {delta !== undefined && delta !== null && (
          <span className={"rd-delta " + (delta >= 0 ? "is-up" : "is-down")} title="نسبت به دوره قبل">
            {delta >= 0 ? "▲" : "▼"} {toPersianDigits(Math.abs(delta))}٪
          </span>
        )}
      </div>
      <b className="rd-kpi__value">{value}</b>
      <span className="rd-kpi__label">{label}</span>
      {note && <span className="rd-kpi__note">{note}</span>}
      {spark && spark.some(Boolean) && <Sparkline values={spark} />}
    </>
  );
  const style = { "--i": i } as React.CSSProperties;
  return href ? (
    <Link href={href} className="rd-kpi rd-rise" style={style}>
      {body}
    </Link>
  ) : (
    <div className="rd-kpi rd-rise" style={style}>
      {body}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 300;
  const h = 32;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 2) - 1).toFixed(1)}`);
  return (
    <svg className="rd-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" pathLength={1} />
    </svg>
  );
}

function Pipeline({ report }: { report: SalesReport }) {
  const max = Math.max(...report.pipeline.map((p) => p.count), 1);
  return (
    <ul className="rd-pipe">
      {report.pipeline.map((p, idx) => (
        <li key={p.status}>
          <Link href={`/admin/collections/orders?where[status][equals]=${p.status}`}>
            <span className="rd-pipe__step">{toPersianDigits(idx + 1)}</span>
            <span className="rd-pipe__label">
              {STATUS_LABEL[p.status]}
              {p.status === "shipped" && <small> ({toPersianDigits(report.days)} روز)</small>}
            </span>
            <span className="rd-pipe__count">{toPersianDigits(p.count)}</span>
            <span className="rd-bar">
              <span style={{ width: `${(p.count / max) * 100}%`, "--d": idx } as React.CSSProperties} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Donut({ fresh, returning }: { fresh: number; returning: number }) {
  const total = fresh + returning;
  if (!total) return <p className="rd-muted">هنوز خریداری در این بازه نبوده.</p>;
  const r = 42;
  const c = 2 * Math.PI * r;
  const part = (fresh / total) * c;
  return (
    <div className="rd-donut">
      <svg viewBox="0 0 110 110" aria-hidden="true">
        <circle cx="55" cy="55" r={r} className="rd-donut__track" />
        <circle
          cx="55"
          cy="55"
          r={r}
          className="rd-donut__returning"
          strokeDasharray={`${c - part - (returning ? 3 : 0)} ${c}`}
          strokeDashoffset={-part}
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          className="rd-donut__new"
          strokeDasharray={`${Math.max(part - (returning ? 3 : 0), 0)} ${c}`}
        />
      </svg>
      <div className="rd-donut__center">
        <b>{toPersianDigits(total)}</b>
        <span>خریدار</span>
      </div>
      <ul className="rd-legend">
        <li>
          <i className="is-new" /> مشتری جدید <b>{toPersianDigits(fresh)}</b>
        </li>
        <li>
          <i className="is-returning" /> خرید دوباره <b>{toPersianDigits(returning)}</b>
        </li>
      </ul>
    </div>
  );
}

function RankCard({
  i,
  icon,
  title,
  unit,
  rows,
}: {
  i: number;
  icon: IconName;
  title: string;
  unit: string;
  rows: Ranked;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="rd-card rd-rank rd-rise" style={{ "--i": i } as React.CSSProperties}>
      <h4>
        <span className="rd-kpi__icon rd-kpi__icon--sm">
          <Icon name={icon} />
        </span>
        {title}
      </h4>
      <ul>
        {rows.map((r, idx) => (
          <li key={r.label}>
            <span className="rd-rank__label">{toPersianDigits(r.label)}</span>
            <span className="rd-rank__value">
              {toPersianDigits(r.value)} {unit}
            </span>
            <span className="rd-bar">
              <span style={{ width: `${(r.value / max) * 100}%`, "--d": idx } as React.CSSProperties} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type IconName =
  | "bag"
  | "plus"
  | "external"
  | "wallet"
  | "receipt"
  | "scissors"
  | "star"
  | "ruler"
  | "palette"
  | "pin"
  | "chart";

// Line icons (24px grid, stroke) so the dashboard needs no icon font.
const ICONS: Record<IconName, string> = {
  bag: "M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0",
  plus: "M12 5v14M5 12h14",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  wallet: "M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11M16 13.5h.01",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6",
  scissors: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.1 7.6 20 18M8.1 16.4 20 6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z",
  ruler: "M3 16 16 3l5 5L8 21l-5-5Zm4-1 2 2m1-5 2 2m1-5 2 2",
  palette:
    "M12 3a9 9 0 0 0 0 18c1 0 1.5-.7 1.5-1.5 0-1.2-1-1.5-1-2.5S13.3 15 14.5 15H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8ZM7.5 12h.01M9.5 8h.01M14.5 8h.01",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H3",
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="rd-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
