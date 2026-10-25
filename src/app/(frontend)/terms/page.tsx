import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("terms");

export default function TermsPage() {
  return (
    <>
      <section className="about-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <span>قوانین و مقررات</span>
          </p>
          <div className="about-hero">
            <p className="eyebrow">
              <span className="eyebrow-line"></span> قوانین و مقررات
            </p>
            <h1>این صفحه به‌زودی تکمیل می‌شه</h1>
            <p>
              متن کامل قوانین و مقررات، حریم خصوصی و شرایط مرجوعی ReySo در حال تدوینه و پیش از راه‌اندازی
              نهایی فروشگاه، همین‌جا منتشر می‌شه. فعلاً خلاصه‌ی شرایط مرجوعی رو می‌تونی در{" "}
              <Link href="/contact" style={{ color: "var(--gold)", textDecoration: "underline" }}>
                صفحه ارتباط با ما
              </Link>{" "}
              ببینی، یا هر سوالی داری از همون‌جا بپرسی.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
