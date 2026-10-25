import type { Metadata } from "next";
import { UiProvider } from "@/components/UiProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu, SearchOverlay, WishlistPanel } from "@/components/layout/Overlays";
import { CartToast, FloatingContact, MobileTabBar } from "@/components/layout/FloatingWidgets";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { SupportChat } from "@/components/layout/SupportChat";
import { QuickView } from "@/components/product/QuickView";
import "@/styles/fonts.css";
import "@/styles/remixicon.css";
import "@/styles/style.css";
import "@/styles/responsive.css";
import "@/styles/loader.css";
import "@/styles/support-chat.css";

const DESCRIPTION =
  "ReySo؛ طراحی و دوخت اختصاصی لباس زنانه با دست‌های ریحانه — مانتو، پیراهن، پالتو و ست‌های فصلی با ظرافت و کیفیت دوخت دست.";

export const metadata: Metadata = {
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <SiteLoader />
        <div className="background-glow"></div>
        <div className="background-glow-soft"></div>
        <div className="background-line"></div>

        <UiProvider>
          <Header />
          <WishlistPanel />
          <MobileMenu />
          <SearchOverlay />

          {children}

          <Footer />
          <FloatingContact />
          <MobileTabBar />
          <SupportChat />
          <QuickView />
          <CartToast />
        </UiProvider>
      </body>
    </html>
  );
}
