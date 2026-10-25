import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Links to the old static pages (shared on Instagram, saved by
// customers, indexed by search engines) keep working. The two detail
// pages carry their id in the query string; src/proxy.ts handles those.
const OLD_PAGES: [string, string][] = [
  ["/index.html", "/"],
  ["/shop.html", "/shop"],
  ["/collections.html", "/collections"],
  ["/cart.html", "/cart"],
  ["/checkout-phone.html", "/checkout/phone"],
  ["/checkout-otp.html", "/checkout/otp"],
  ["/checkout-profile.html", "/checkout/details"],
  ["/checkout-review.html", "/checkout/review"],
  ["/profile.html", "/profile"],
  ["/track-order.html", "/track-order"],
  ["/about.html", "/about"],
  ["/contact.html", "/contact"],
  ["/education.html", "/education"],
  ["/terms.html", "/terms"],
];

// PAGES_BASE_PATH is set by the GitHub Pages preview workflow: the site
// is then exported as static files served from /<repo>, without the
// admin panel, redirects or src/proxy.ts (the workflow removes those).
const pagesBasePath = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  // Customer accounts (SMS login) live on the server when there's a
  // database; otherwise they stay in the browser as on the old site.
  env: { NEXT_PUBLIC_ACCOUNTS_API: process.env.DATABASE_URL ? "1" : "" },
  async redirects() {
    return OLD_PAGES.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

// withPayload in both cases: it keeps Payload's server packages out of the
// bundle, which the catalogue loader imports even when it isn't used.
export default withPayload(
  pagesBasePath
    ? { output: "export", basePath: pagesBasePath, experimental: { globalNotFound: true } }
    : nextConfig,
  { devBundleServerPackages: false },
);
