import type { Metadata } from "next";
import { siteMetadata } from "./(frontend)/layout";
import { SiteShell } from "@/components/layout/SiteShell";
import { NotFoundContent } from "@/components/pages/NotFoundContent";
import { pageMetadata } from "@/lib/seo";

// Unmatched URLs. The storefront and the admin panel have separate root
// layouts, so this page brings the site shell itself.
export const metadata: Metadata = { ...siteMetadata, ...pageMetadata("404"), title: "ReySo | صفحه پیدا نشد" };

export default function GlobalNotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <SiteShell>
          <NotFoundContent />
        </SiteShell>
      </body>
    </html>
  );
}
