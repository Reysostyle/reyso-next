"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/cart";

// Open/closed state for the site-wide overlays (mobile menu, search,
// wishlist panel, quick view) and the add-to-cart toast. The old site
// toggled these with document-level click handlers; the CSS still keys
// off the same body classes, so this keeps them in sync.

type UiState = {
  menuOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;
  quickViewId: string | null;
  cartToast: { item: CartLine; key: number } | null;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  openQuickView: (id: string | null) => void;
  showCartToast: (item: CartLine | null) => void;
};

const UiContext = createContext<UiState | null>(null);

export function useUi(): UiState {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}

function useBodyClass(className: string, active: boolean) {
  useEffect(() => {
    document.body.classList.toggle(className, active);
    return () => document.body.classList.remove(className);
  }, [className, active]);
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<UiState["cartToast"]>(null);

  useBodyClass("menu-open", menuOpen);
  useBodyClass("search-open", searchOpen);
  useBodyClass("qv-open", quickViewId !== null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setSearchOpen(false);
      setQuickViewId(null);
    };
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const showCartToast = useCallback((item: CartLine | null) => {
    setCartToast(item ? { item, key: Date.now() } : null);
  }, []);

  const value = useMemo<UiState>(
    () => ({
      menuOpen,
      searchOpen,
      wishlistOpen,
      quickViewId,
      cartToast,
      setMenuOpen,
      setSearchOpen,
      setWishlistOpen,
      openQuickView: setQuickViewId,
      showCartToast,
    }),
    [menuOpen, searchOpen, wishlistOpen, quickViewId, cartToast, showCartToast],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
