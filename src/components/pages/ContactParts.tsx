"use client";

import { useState } from "react";

// The form has no backend yet; submitting shows a note instead.
export function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="contact-form"
      id="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h3>پیام بفرست</h3>
      <div className="contact-field">
        <label htmlFor="cf-name">نام</label>
        <input type="text" id="cf-name" placeholder="نام شما" />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-email">ایمیل</label>
        <input type="email" id="cf-email" placeholder="ایمیل شما" />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-subject">موضوع</label>
        <input type="text" id="cf-subject" placeholder="موضوع پیام" />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-message">پیام</label>
        <textarea id="cf-message" rows={5} placeholder="پیام‌تون رو بنویسید..."></textarea>
      </div>
      <button type="submit" className="contact-submit-btn" id="contact-submit-btn" disabled={sent}>
        ارسال پیام
      </button>
      <p className="contact-form-note" id="contact-form-note" hidden={!sent}>
        این فرم به‌زودی فعال می‌شه؛ فعلاً از اینستاگرام یا واتس‌اپ پیام بدید.
      </p>
    </form>
  );
}

const FAQ = [
  [
    "ارسال سفارش چقدر طول می‌کشه؟",
    "چون هر قطعه اختصاصی دوخته می‌شه، معمولاً بین ۵ تا ۱۰ روز کاری زمان می‌بره؛ این مدت برای هر سفارش از طریق پیام اطلاع داده می‌شه.",
  ],
  [
    "امکان مرجوع کردن محصول هست؟",
    "در صورت مغایرت سایز یا ایراد در دوخت، تا ۷۲ ساعت بعد از تحویل امکان مرجوعی وجود داره.",
  ],
  [
    "چطور سایز مناسبم رو انتخاب کنم؟",
    "روی هر محصول راهنمای سایزبندی هست؛ برای مشاوره دقیق‌تر هم می‌تونی از طریق واتس‌اپ سایزهای بدنت رو بفرستی.",
  ],
  [
    "روش‌های پرداخت چیه؟",
    "فعلاً پرداخت به‌صورت کارت‌به‌کارت انجام می‌شه؛ درگاه پرداخت آنلاین به‌زودی اضافه می‌شه.",
  ],
];

// One question open at a time.
export function ContactFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="contact-faq">
      <h3>سوالات متداول</h3>
      {FAQ.map(([q, a], i) => (
        <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
          <button type="button" className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
            {q}
            <i className="ri-add-line"></i>
          </button>
          <div className="faq-answer">
            <p>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
