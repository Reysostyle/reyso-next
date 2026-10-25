import Link from "next/link";
import { HeroSlider } from "@/components/home/HeroSlider";
import { StoryReveal } from "@/components/home/StoryReveal";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

/* eslint-disable @next/next/no-img-element */

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-left">
            <p className="eyebrow">
              <span className="eyebrow-line"></span>
              طراحی و دوخت اختصاصی لباس زنانه با عشق و ظرافت
            </p>
            <h1>
              ReySo <span>امضای استایل تو</span>
            </h1>
            <p className="hero-description">
              فراتر از فصل و مد؛ ReySo لباسی‌ست که با تو می‌ماند. طراحی‌شده برای زنی که ظرافت را در سکوت
              می‌پسندد، نه در هیاهو.
            </p>
            <div className="features">
              <div className="tag">دوخت اختصاصی</div>
              <div className="tag">پارچه منتخب</div>
              <div className="tag">توجه به جزئیات</div>
            </div>
            <Link href="/collections" className="shop-btn">
              مشاهده کالکشن
            </Link>
          </div>
          <HeroSlider />
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <div className="categories-head">
            <p className="eyebrow">
              <span className="eyebrow-line"></span>
              دسته‌بندی محصولات
            </p>
          </div>
          <div className="category-grid">
            <Link href="/collections/مانتو" className="category-card">
              <img loading="lazy" src="/images/manto.jpg" alt="مانتو" />
              <span className="category-label">مانتو</span>
            </Link>
            <Link href="/collections/پالتو" className="category-card">
              <img loading="lazy" src="/images/hero2.jpg" alt="پالتو" />
              <span className="category-label">پالتو</span>
            </Link>
            <Link href="/collections/شومیز" className="category-card">
              <img loading="lazy" src="/images/hero3.jpg" alt="شومیز" />
              <span className="category-label">شومیز</span>
            </Link>
            <Link href="/collections/کت و شلوار" className="category-card">
              <img loading="lazy" src="/images/hero4.jpg" alt="کت و شلوار" />
              <span className="category-label">کت و شلوار</span>
            </Link>
            <Link href="/collections/پیراهن" className="category-card">
              <img loading="lazy" src="/images/hero5.jpg" alt="پیراهن" />
              <span className="category-label">پیراهن</span>
            </Link>
            <Link href="/collections/ست" className="category-card">
              <img loading="lazy" src="/images/set-2.jpg" alt="ست فصلی" />
              <span className="category-label">ست فصلی</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="season-banner-section">
        <div className="container">
          <Link href="/collections/ست" className="season-banner">
            <img loading="lazy" src="/images/set-4.jpg" alt="ست فصلی" />
            <div className="season-banner-overlay">
              <span className="season-banner-badge">کالکشن جدید</span>
              <h2>ست فصلی</h2>
              <p>ست‌های دوتکه‌ی فصل جدید؛ ترکیبی از راحتی و ظرافت، برای هر ساعت از روز.</p>
              <span className="season-banner-btn">
                مشاهده ست فصلی <i className="ri-arrow-left-line"></i>
              </span>
            </div>
          </Link>
        </div>
      </section>

      <StoryReveal />

      <section className="products" id="products-section">
        <div className="container">
          <div className="products-head">
            <p className="eyebrow">
              <span className="eyebrow-line"></span>
              پرفروش‌ترین‌ها
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      <section className="editorial">
        <div className="container">
          <div className="editorial-frame">
            <img loading="lazy" src="/images/hero1.jpg" alt="پشت صحنه‌ی خلق ReySo" />
            <div className="editorial-overlay">
              <p className="eyebrow">
                <span className="eyebrow-line"></span>
                پشت صحنه
              </p>
              <h2>هر قطعه، از دستان رِیحانه می‌گذرد</h2>
              <p>
                پیش از رسیدن به ویترین، هر لباس ReySo ساعت‌ها زمان، دقت و صبوریِ دست‌های رِیحانه را تجربه
                می‌کند.
              </p>
              <Link href="/about" className="ghost-btn">
                بیشتر بدانید
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-section">
        <div className="container trust-container">
          <div className="trust-media">
            <video
              src="/videos/swing-machine.mp4"
              poster="/images/trust-poster.jpg"
              preload="metadata"
              autoPlay
              muted
              loop
              playsInline
            ></video>
          </div>
          <div className="trust-content">
            <h3>مورد اعتماد هزاران زن؛ با تولیدی پایدار و اخلاق‌مدار</h3>
            <ul className="trust-list">
              <li>
                <i className="ri-checkbox-circle-fill"></i> محصولات باکیفیت
              </li>
              <li>
                <i className="ri-checkbox-circle-fill"></i> پارچه‌های ممتاز و دوخت با ظرافت دست
              </li>
              <li>
                <i className="ri-checkbox-circle-fill"></i> سایزبندی متناسب با هر اندام
              </li>
              <li>
                <i className="ri-checkbox-circle-fill"></i> طراحی‌های بی‌زمان و الهام‌گرفته از ترند روز
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
