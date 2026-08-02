"use client";

import { motion } from "framer-motion";
import styles from "./Hero.module.css";

const STITCH_DURATION = 1.5;

export default function HeroContent() {
  return (
    <div className={styles.content}>
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: STITCH_DURATION, ease: [0.22, 0.61, 0.36, 1] }}
        className={`type-eyebrow ${styles.eyebrow}`}
      >
        دوخت دست، طراحی ایرانی
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: STITCH_DURATION + 0.15, ease: [0.22, 0.61, 0.36, 1] }}
        className={`type-display-hero font-display ${styles.title}`}
      >
        ظرافتی که
        <br />
        روایت می‌شود
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: STITCH_DURATION + 0.35, ease: [0.22, 0.61, 0.36, 1] }}
        className={`type-body ${styles.description}`}
      >
        هر قطعه‌ی ReySo با دست طراحی و دوخته می‌شود؛ برای زنی که سادگی را
        فاخر می‌پسندد.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: STITCH_DURATION + 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        className={styles.actions}
      >
        <button className="pill-button">مشاهده کالکشن</button>
        <button className="pill-button pill-button--ghost">داستان برند</button>
      </motion.div>
    </div>
  );
}
