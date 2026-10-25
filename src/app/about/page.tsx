import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

/* eslint-disable @next/next/no-img-element */

export const metadata = pageMetadata("about", "/about");

export default function AboutPage() {
  return (
    <>
      <section className="about-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <span>درباره ما</span>
          </p>
          <div className="about-hero">
            <p className="eyebrow">
              <span className="eyebrow-line"></span> داستان ReySo
            </p>
            <h1>لباسی که با دست‌های ریحانه شکل می‌گیرد</h1>
            <p>
              ReySo از یه اتاق کوچیک دوخت شروع شد؛ جایی که رِیحانه سهرابی هر قطعه رو با دقت طراحی و با دست‌های
              خودش می‌دوزه. ما هنوز هم به همون شکل کار می‌کنیم — کیفیت رو فدای عجله نمی‌کنیم.
            </p>
          </div>
          <div className="about-story">
            <div className="about-story-media">
              <img loading="lazy" src="/images/trust-poster.jpg" alt="اتلیه ReySo" />
            </div>
            <div className="about-story-text">
              <p className="eyebrow">
                <span className="eyebrow-line"></span> بنیان‌گذار
              </p>
              <h2>رِیحانه سهرابی</h2>
              <p>
                رِیحانه از سال‌ها پیش، با علاقه به الگوسازی و دوخت، شروع به طراحی لباس‌های زنانه کرد. ReySo
                حاصل همین علاقه‌ست: برندی که هر قطعه‌اش داستان یه دوخت دستی و یه انتخاب آگاهانه از پارچه و
                رنگه.
              </p>
              <p>
                امروز، در کنار طراحی و دوخت، رِیحانه دوره‌های آموزشی الگوسازی و خیاطی هم برگزار می‌کنه تا این
                تجربه رو با دیگران هم به اشتراک بذاره.
              </p>
              <Link href="/education" className="outline-btn">
                آموزش با ریحانه
              </Link>
            </div>
          </div>
          <div className="about-stats">
            <div className="about-stat">
              <span className="about-stat-num">+۵</span>
              <span className="about-stat-label">سال تجربه دوخت</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">+۲۰۰</span>
              <span className="about-stat-label">قطعه دوخته‌شده</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">۱۰۰٪</span>
              <span className="about-stat-label">دوخت دست و اختصاصی</span>
            </div>
          </div>
          <div className="about-values">
            <p className="eyebrow" style={{ justifyContent: "center" }}>
              <span className="eyebrow-line"></span> اصول ما
            </p>
            <h2 className="about-values-title">چیزی که ReySo رو ReySo می‌کنه</h2>
            <div className="about-values-grid">
              <div className="about-value-card">
                <i className="ri-hand-heart-line"></i>
                <h3>دوخت دست</h3>
                <p>هر قطعه با دقت و صبر دوخته می‌شه، نه با خط تولید انبوه.</p>
              </div>
              <div className="about-value-card">
                <i className="ri-leaf-line"></i>
                <h3>تولید پایدار</h3>
                <p>انتخاب پارچه و تولید محدود، بدون اسراف و دورریز اضافه.</p>
              </div>
              <div className="about-value-card">
                <i className="ri-award-line"></i>
                <h3>کیفیت ماندگار</h3>
                <p>پارچه‌ها و دوخت‌هایی که برای دوام سال‌ها انتخاب می‌شن.</p>
              </div>
              <div className="about-value-card">
                <i className="ri-sparkling-2-line"></i>
                <h3>طراحی بی‌زمان</h3>
                <p>مدل‌هایی که وابسته به یه ترند زودگذر نیستن.</p>
              </div>
            </div>
          </div>
          <div className="about-cta">
            <h3>کالکشن فعلی ReySo رو ببین</h3>
            <Link href="/shop" className="shop-btn">
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
