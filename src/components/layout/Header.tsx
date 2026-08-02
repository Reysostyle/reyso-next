import Link from "next/link";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "محصولات" },
  { href: "/collections", label: "کالکشن‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "ارتباط با ما" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          ReySo
        </Link>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconButton} aria-label="جستجو">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className={styles.iconButton} aria-label="علاقه‌مندی‌ها">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.4 4.5 6 4.5c2 0 3.5 1.1 4.5 2.7C11.5 5.6 13 4.5 15 4.5c3.6 0 5.5 3.6 4 7.2C19.5 16.4 12 21 12 21z" />
            </svg>
          </button>
          <button className={styles.iconButton} aria-label="سبد خرید">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 6h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6z" />
              <path d="M8 6V5a4 4 0 0 1 8 0v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
