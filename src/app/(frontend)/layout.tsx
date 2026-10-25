import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";

const DESCRIPTION =
  "ReySo؛ طراحی و دوخت اختصاصی لباس زنانه با دست‌های ریحانه — مانتو، پیراهن، پالتو و ست‌های فصلی با ظرافت و کیفیت دوخت دست.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ReySo | خانه", template: "ReySo | %s" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ReySo",
    description: DESCRIPTION,
    images: ["/images/hero1.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/images/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const metadata = siteMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
