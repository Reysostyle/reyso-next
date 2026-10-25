"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LESSONS, LESSON_CATEGORIES, type Lesson } from "@/lib/lessons";

/* eslint-disable @next/next/no-img-element */

const ALL = "همه";

function LessonModal({ lesson, onClose }: { lesson: Lesson | null; onClose: () => void }) {
  useEffect(() => {
    if (!lesson) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [lesson, onClose]);

  return (
    <div className={"edu-modal" + (lesson ? " open" : "")} id="edu-modal">
      <div className="edu-modal-backdrop" id="edu-modal-backdrop" onClick={onClose}></div>
      <div className="edu-modal-box">
        <button className="edu-modal-close" id="edu-modal-close" aria-label="بستن" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
        <div className="edu-modal-player" id="edu-modal-player">
          {lesson &&
            (lesson.aparatId ? (
              <iframe
                src={"https://www.aparat.com/video/video/embed/videohash/" + lesson.aparatId + "/vt/frame"}
                allowFullScreen
                loading="lazy"
                title={lesson.title}
              ></iframe>
            ) : (
              <div className="edu-coming-soon">
                <i className="ri-film-line"></i>
                <p>این ویدیو به‌زودی روی آپارات بارگذاری می‌شه.</p>
              </div>
            ))}
        </div>
        <div className="edu-modal-info">
          <span className="edu-modal-tag" id="edu-modal-tag">
            {lesson?.category}
          </span>
          <h3 id="edu-modal-title">{lesson?.title}</h3>
          <p id="edu-modal-desc">{lesson?.description}</p>
        </div>
      </div>
    </div>
  );
}

export function EducationView() {
  const [category, setCategory] = useState(ALL);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const close = useCallback(() => setLesson(null), []);
  const list = category === ALL ? LESSONS : LESSONS.filter((l) => l.category === category);

  return (
    <>
      <section className="edu-section">
        <div className="container">
          <p className="pd-crumbs">
            <Link href="/">خانه</Link> / <span>آموزش</span>
          </p>
          <div className="edu-hero">
            <div className="edu-hero-text">
              <p className="eyebrow">
                <span className="eyebrow-line"></span> آموزش ReySo
              </p>
              <h1>آموزش خیاطی و طراحی لباس با ریحانه</h1>
              <p>
                مجموعه‌ای از درس‌های عملی الگوسازی، دوخت و طراحی لباس؛ همون تجربه‌ای که پشت هر قطعه‌ی ReySo
                نشسته، این‌بار قدم‌به‌قدم و قابل یادگیری.
              </p>
            </div>
            <div className="edu-instructor">
              <img loading="lazy" src="/images/trust-poster.jpg" alt="رِیحانه سهرابی" />
              <div className="edu-instructor-info">
                <p className="edu-instructor-name">رِیحانه سهرابی</p>
                <p className="edu-instructor-role">طراح و مدرس دوخت ReySo</p>
                <div className="edu-instructor-stats">
                  <span>
                    <i className="ri-play-circle-line"></i>{" "}
                    <span id="edu-lesson-count">{LESSONS.length.toLocaleString("fa-IR")}</span> ویدیوی آموزشی
                  </span>
                  <span>
                    <i className="ri-price-tag-3-line"></i> {LESSON_CATEGORIES.length.toLocaleString("fa-IR")}{" "}
                    دسته‌بندی
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="edu-tabs" id="edu-tabs">
            {[ALL, ...LESSON_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                className={"edu-tab" + (cat === category ? " active" : "")}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="edu-grid" id="edu-grid">
            {list.map((l) => (
              <button key={l.id} type="button" className="edu-card" onClick={() => setLesson(l)}>
                <div className="edu-card-media">
                  <img loading="lazy" src={l.thumbnail} alt={l.title} />
                  <span className="edu-play-btn">
                    <i className="ri-play-fill"></i>
                  </span>
                  <span className="edu-duration">{l.duration}</span>
                </div>
                <div className="edu-card-info">
                  <span className="edu-card-tag">{l.category}</span>
                  <p className="edu-card-title">{l.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <LessonModal lesson={lesson} onClose={close} />
    </>
  );
}
