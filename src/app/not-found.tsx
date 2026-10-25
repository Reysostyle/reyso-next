import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("404");

export default function NotFound() {
  return (
    <>
      <section className="not-found-section">
        <div className="container">
          <p className="not-found-eyebrow">
            <span className="eyebrow-line"></span>
            خطای ۴۰۴
          </p>
          <h1 className="not-found-code">۴۰۴</h1>
          <h2 className="not-found-title">این صفحه رو پیدا نکردیم</h2>
          <p className="not-found-text">
            ممکنه لینک اشتباه باشه یا این صفحه جابه‌جا شده باشه. از اینجا می‌تونی به فروشگاه یا صفحه اصلی
            برگردی.
          </p>
          <div className="not-found-actions">
            <Link href="/shop" className="shop-btn">
              مشاهده محصولات
            </Link>
            <Link href="/" className="not-found-home-link">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
