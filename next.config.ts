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

const nextConfig: NextConfig = {
  async redirects() {
    return [...OLD_PAGES.map(([source, destination]) => ({ source, destination, permanent: true }))];
  },
};

export default nextConfig;
