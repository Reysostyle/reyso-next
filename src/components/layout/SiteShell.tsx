import { CatalogProvider } from "@/components/CatalogProvider";
import { UiProvider } from "@/components/UiProvider";
import { getCatalog } from "@/lib/catalog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu, SearchOverlay, WishlistPanel } from "@/components/layout/Overlays";
import { CartToast, FloatingContact, MobileTabBar } from "@/components/layout/FloatingWidgets";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { SupportChat } from "@/components/layout/SupportChat";
import { AccountSync } from "@/components/layout/AccountSync";
import { QuickView } from "@/components/product/QuickView";
import "@/styles/fonts.css";
import "@/styles/remixicon.css";
import "@/styles/style.css";
import "@/styles/responsive.css";
import "@/styles/loader.css";
import "@/styles/support-chat.css";
// Everything around a storefront page: background, header, overlays,
// footer and floating widgets. Shared by the root layout and the global
// 404 page (which renders outside any layout).
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <>
      <SiteLoader />
      <div className="background-glow"></div>
      <div className="background-glow-soft"></div>
      <div className="background-line"></div>

      <CatalogProvider catalog={catalog}>
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
          <AccountSync />
        </UiProvider>
      </CatalogProvider>
    </>
  );
}
