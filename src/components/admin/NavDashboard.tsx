"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";

// Brand block and "داشبورد" at the top of the sidebar. The link uses
// Payload's own nav classes; its icon comes from custom.scss like the rest.
export default function NavDashboard() {
  const active = usePathname() === "/admin";
  const label = (
    <>
      {active && <div className="nav__link-indicator" />}
      <span className="nav__link-label">داشبورد</span>
    </>
  );
  return (
    <>
      <Link href="/admin" className="reyso-nav-brand" prefetch={false}>
        <img src="/images/headerlogo.png" alt="" width={34} height={35} />
        <span>
          <b>ReySo</b>
          <small>پنل مدیریت فروشگاه</small>
        </span>
      </Link>
      {active ? (
        <div className="nav__link active" id="nav-dashboard">
          {label}
        </div>
      ) : (
        <Link className="nav__link" href="/admin" id="nav-dashboard" prefetch={false}>
          {label}
        </Link>
      )}
    </>
  );
}
