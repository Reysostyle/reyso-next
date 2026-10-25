import Link from "next/link";
import { ContactFaq, ContactForm } from "@/components/pages/ContactParts";
import { INSTAGRAM_URL, contactLinks } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("contact", "/contact");

// Unset channels stay "#" links, so don't open those in a new tab.
const external = (href: string) => (href === "#" ? {} : { target: "_blank", rel: "noopener" });

export default function ContactPage() {
  const links = contactLinks();
  return (
    <section className="contact-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <span>ارتباط با ما</span>
        </p>
        <div className="contact-hero">
          <p className="eyebrow">
            <span className="eyebrow-line"></span> ارتباط با ReySo
          </p>
          <h1>سوالی داری؟ خوشحال می‌شیم کمکت کنیم</h1>
          <p>
            برای سفارش‌های اختصاصی، راهنمایی سایز، یا هر سوال دیگه‌ای، از راه‌های زیر می‌تونی با ما در ارتباط
            باشی.
          </p>
        </div>
        <div className="contact-channels">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="contact-channel">
            <i className="ri-instagram-line"></i>
            <h3>اینستاگرام</h3>
            <p>reyso.style@</p>
          </a>
          <a href={links.telegram} {...external(links.telegram)} className="contact-channel">
            <i className="ri-telegram-line"></i>
            <h3>تلگرام</h3>
            <p>پاسخ‌گویی در ساعات اداری</p>
          </a>
          <a href={links.whatsapp} {...external(links.whatsapp)} className="contact-channel">
            <i className="ri-whatsapp-line"></i>
            <h3>واتس‌اپ</h3>
            <p>سفارش و مشاوره سایز</p>
          </a>
        </div>
        <div className="contact-layout">
          <ContactForm />
          <ContactFaq />
        </div>
      </div>
    </section>
  );
}
