"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "داشبورد" at the top of the sidebar, styled like Payload's own links.
export default function NavDashboard() {
  const active = usePathname() === "/admin";
  const label = (
    <>
      {active && <div className="nav__link-indicator" />}
      <span className="nav__link-label reyso-nav-dash">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm-1-17v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1Z"
          />
        </svg>
        داشبورد
      </span>
    </>
  );
  return active ? (
    <div className="nav__link reyso-nav-dash-link active" id="nav-dashboard">
      {label}
    </div>
  ) : (
    <Link className="nav__link reyso-nav-dash-link" href="/admin" id="nav-dashboard" prefetch={false}>
      {label}
    </Link>
  );
}
