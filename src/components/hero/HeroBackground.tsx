"use client";

import { motion } from "framer-motion";
import styles from "./Hero.module.css";

/**
 * Full-bleed hero backdrop. Placeholder gradient stands in for a real
 * studio photograph — swap the background-image below for an actual
 * product/editorial shot once available (recommend a moody, low-key
 * portrait so the aubergine overlay reads naturally).
 */
export default function HeroBackground() {
  return (
    <div className={styles.backgroundLayer}>
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 75% 15%, #4a2038 0%, #241220 55%, #160b14 100%)",
        }}
      />
      {/* Contrast scrim so ivory text stays readable over any future photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(0deg, rgba(22,11,20,0.92) 0%, rgba(22,11,20,0.35) 45%, rgba(22,11,20,0.15) 100%)",
        }}
      />
    </div>
  );
}
