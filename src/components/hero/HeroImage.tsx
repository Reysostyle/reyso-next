"use client";

import { motion } from "framer-motion";
import styles from "./Hero.module.css";

/**
 * Signature reveal: the image unfolds like a piece of drawn fabric,
 * a clip-path sweep rather than a generic fade — nods to the brand's
 * craft of cutting and draping cloth.
 *
 * TODO: replace the gradient placeholder below with a real product
 * photograph once it's available (recommend a tall 3:4 studio shot).
 */
export default function HeroImage() {
  return (
    <div className={styles.imageWrap}>
      <motion.div
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        animate={{ clipPath: "inset(0 0 0 0%)" }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(155deg, var(--color-green) 0%, var(--color-green-deep) 60%, var(--color-ink) 100%)",
        }}
      />
      <div className={styles.imageCaption}>کالکشن پاییز — مانتو و پالتو</div>
    </div>
  );
}
