"use client";

import { motion } from "framer-motion";
import styles from "./Hero.module.css";

/**
 * Signature element: a single copper thread stitching itself across the
 * hero on load — a direct nod to hand-sewing rather than a generic line
 * animation. Dash pattern reads as running stitch rather than a plain rule.
 */
export default function HeroStitch() {
  return (
    <div className={styles.stitchLayer}>
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <motion.path
          d="M -40 620 C 300 560, 550 700, 820 540 S 1350 460, 1500 520"
          fill="none"
          stroke="var(--color-copper)"
          strokeWidth="2.5"
          strokeDasharray="10 9"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </div>
  );
}
