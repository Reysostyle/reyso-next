"use client";

import { createLocalStore, useLocalStore } from "./local-store";

// localStorage cart, keyed by product id + size + color like the old
// js/cart.js. Prices here are display copies only; the order backend
// must re-price from the catalogue before charging.

export type CartLine = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

export const cartStore = createLocalStore<CartLine[]>("reyso_cart", []);

export function getCart(): CartLine[] {
  return cartStore.get();
}

export function useCart(): CartLine[] {
  return useLocalStore(cartStore);
}

export function addToCart(item: CartLine) {
  const list = getCart().map((l) => ({ ...l }));
  const existing = list.find(
    (line) => line.id === item.id && line.size === item.size && line.color === item.color,
  );
  if (existing) existing.qty += item.qty;
  else list.push(item);
  cartStore.set(list);
}

export function removeCartLine(index: number): CartLine | null {
  const list = [...getCart()];
  const [line] = list.splice(index, 1);
  cartStore.set(list);
  return line ?? null;
}

export function insertCartLine(line: CartLine, index: number) {
  const list = [...getCart()];
  list.splice(Math.min(index, list.length), 0, line);
  cartStore.set(list);
}

export function updateCartLineQty(index: number, qty: number) {
  const list = getCart().map((l) => ({ ...l }));
  if (!list[index]) return;
  list[index].qty = Math.max(1, qty);
  cartStore.set(list);
}

export function clearCart() {
  cartStore.set([]);
}

export function cartCount(list: CartLine[]): number {
  return list.reduce((sum, line) => sum + line.qty, 0);
}

export function cartSubtotal(list: CartLine[]): number {
  return list.reduce((sum, line) => sum + line.price * line.qty, 0);
}
