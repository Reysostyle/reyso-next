"use client";

import { createLocalStore, useLocalStore } from "./local-store";
import { getLoggedInPhone, getMockCustomer, saveMockCustomer } from "./customer";

// Saved product ids. While a customer is logged in the list is mirrored
// into their (mock) account record so it survives logout/login.

export const wishlistStore = createLocalStore<string[]>("reyso_wishlist", []);

export function useWishlist(): string[] {
  return useLocalStore(wishlistStore);
}

export function saveWishlist(list: string[]) {
  wishlistStore.set(list);
  const phone = getLoggedInPhone();
  if (phone) saveMockCustomer(phone, { wishlist: list });
}

export function toggleWishlist(id: string): boolean {
  const list = [...wishlistStore.get()];
  const index = list.indexOf(id);
  if (index === -1) list.push(id);
  else list.splice(index, 1);
  saveWishlist(list);
  return index === -1;
}

export function removeFromWishlist(id: string) {
  saveWishlist(wishlistStore.get().filter((x) => x !== id));
}

/** The account is the source of truth once logged in. */
export function syncWishlistWithAccount() {
  const phone = getLoggedInPhone();
  if (!phone) return;
  wishlistStore.set(getMockCustomer(phone)?.wishlist ?? []);
}
