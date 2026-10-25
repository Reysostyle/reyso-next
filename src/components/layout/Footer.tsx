"use client";

import Link from "next/link";
import { useState } from "react";
import { INSTAGRAM_URL, contactLinks } from "@/lib/config";

/* eslint-disable @next/next/no-img-element */

const FOOTER_CATEGORIES = ["مانتو", "پالتو", "شومیز", "کت و شلوار", "پیراهن"];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [note, setNote] = useState("به‌زودی فعال می‌شود");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setNote("یه ایمیل معتبر وارد کن.");
      return;
    }
    if (!agreed) {
      setNote("برای عضویت، باید با قوانین موافقت کنی.");
      return;
    }
    try {
      const list: string[] = JSON.parse(localStorage.getItem("reyso_newsletter_emails") || "[]");
      if (!list.includes(value)) list.push(value);
      localStorage.setItem("reyso_newsletter_emails", JSON.stringify(list));
    } catch {
      // confirmation below still applies
    }
    setNote("ثبت شد! به محض فعال شدن خبرنامه، بهت خبر می‌دیم.");
    setEmail("");
    setAgreed(false);
  }

  return (
    <>
      <form className="newsletter-form" id="newsletter-form" onSubmit={onSubmit}>
        <input
          type="email"
          id="newsletter-email"
          placeholder="ایمیل شما"
          aria-label="ایمیل"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" aria-label="عضویت">
          عضویت
        </button>
      </form>
      <label className="newsletter-agree">
        <input
          type="checkbox"
          id="newsletter-agree-check"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>با ثبت فرم، با قوانین و مقررات موافقت می‌کنم</span>
      </label>
      <p className="newsletter-note" id="newsletter-note">
        {note}
      </p>
    </>
  );
}

export function Footer() {
  const links = contactLinks();

  return (
    <footer className="site-footer">
      <div className="container footer-cards">
        <div className="footer-card footer-card-main">
          <div className="footer-glow"></div>

          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <img src="/images/footer-logo-reyso.png" alt="ReySo Logo" />
              </Link>
              <p className="footer-about">
                ReySo با دست‌های رِیحانه شکل می‌گیرد؛ طراحی و دوخت اختصاصیِ پوشاک زنانه، برای زنانی که ظرافت
                را در سکوت می‌پسندند.
              </p>
              <div className="footer-social">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener" aria-label="اینستاگرام ReySo">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href={links.telegram} aria-label="تلگرام ReySo">
                  <i className="ri-telegram-line"></i>
                </a>
                <a href={links.whatsapp} aria-label="واتس‌اپ ReySo">
                  <i className="ri-whatsapp-line"></i>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>دسترسی سریع</h4>
              <ul>
                <li>
                  <Link href="/">خانه</Link>
                </li>
                <li>
                  <Link href="/shop">محصولات</Link>
                </li>
                <li>
                  <Link href="/education">آموزش</Link>
                </li>
                <li>
                  <Link href="/about">درباره ما</Link>
                </li>
                <li>
                  <Link href="/track-order">پیگیری سفارش</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>دسته‌بندی‌ها</h4>
              <ul>
                {FOOTER_CATEGORIES.map((c) => (
                  <li key={c}>
                    <Link href={"/shop?category=" + encodeURIComponent(c)}>{c}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <p>© ۱۴۰۵ ReySo. تمامی حقوق محفوظ است.</p>
            <p className="footer-signature">طراحی و توسعه با ظرافت</p>
          </div>
        </div>

        <div className="footer-card footer-card-newsletter">
          <h4>عضویت در خبرنامه ReySo</h4>
          <p>
            به جمع اختصاصی ما بپیوندید و اولین نفری باشید که از کالکشن‌های جدید و رازهای استایل باخبر می‌شوید.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
