import Header from "@/components/layout/Header";
import HeroBackground from "./HeroBackground";
import HeroStitch from "./HeroStitch";
import HeroContent from "./HeroContent";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <HeroBackground />
      <HeroStitch />
      <Header />
      <HeroContent />
    </section>
  );
}
