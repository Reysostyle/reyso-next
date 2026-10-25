"use client";

import { createLocalStore, readRaw, useLocalStore, useRaw, writeRaw } from "./local-store";

// Mock customer records kept in localStorage, same shape as the old
// js/customer-store.js. Real accounts come with the backend phase.

export const CHECKOUT_PHONE_KEY = "reyso_checkout_phone";
export const CHECKOUT_VERIFIED_KEY = "reyso_checkout_verified";

export type Address = {
  id: string;
  label?: string;
  province?: string;
  city?: string;
  full: string;
  postal: string;
  isDefault?: boolean;
};

export type Customer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday?: string;
  addresses?: Address[];
  address?: Omit<Address, "id">; // legacy single-address shape
  shipping?: string;
  shippingCost?: number;
  wishlist?: string[];
  [key: string]: unknown;
};

export const customersStore = createLocalStore<Record<string, Customer>>("reyso_customers", {});

export function getMockCustomer(phone: string | null): Customer | null {
  if (!phone) return null;
  return customersStore.get()[phone] ?? null;
}

export function saveMockCustomer(phone: string, data: Partial<Customer>): Customer {
  const customers = { ...customersStore.get() };
  customers[phone] = { ...customers[phone], ...data };
  customersStore.set(customers);
  return customers[phone];
}

export function useCustomer(phone: string | null): Customer | null {
  const customers = useLocalStore(customersStore);
  return phone ? (customers[phone] ?? null) : null;
}

/* ---------- session ---------- */

export function getLoggedInPhone(): string | null {
  const phone = readRaw(CHECKOUT_PHONE_KEY);
  const verified = readRaw(CHECKOUT_VERIFIED_KEY) === "1";
  return phone && verified ? phone : null;
}

export function useLoggedInPhone(): string | null {
  const phone = useRaw(CHECKOUT_PHONE_KEY);
  const verified = useRaw(CHECKOUT_VERIFIED_KEY) === "1";
  return phone && verified ? phone : null;
}

export function setCheckoutPhone(phone: string | null) {
  writeRaw(CHECKOUT_PHONE_KEY, phone);
}

export function setVerified(verified: boolean) {
  writeRaw(CHECKOUT_VERIFIED_KEY, verified ? "1" : null);
}

/** Phone verified and a profile with a first name saved. */
export function isReturningCustomer(): boolean {
  const phone = getLoggedInPhone();
  return !!getMockCustomer(phone)?.firstName;
}

export function useIsReturningCustomer(): boolean {
  const phone = useLoggedInPhone();
  const customer = useCustomer(phone);
  return !!customer?.firstName;
}

/* ---------- addresses ---------- */

export function getCustomerAddresses(customer: Customer | null): Address[] {
  if (!customer) return [];
  if (customer.addresses && customer.addresses.length) return customer.addresses;
  // Older records stored a single `address`; read it as a one-item list.
  if (customer.address && customer.address.full) {
    return [{ id: "addr-legacy", label: "آدرس اصلی", isDefault: true, ...customer.address }];
  }
  return [];
}

export function getDefaultAddress(customer: Customer | null): Address | null {
  const list = getCustomerAddresses(customer);
  return list.find((a) => a.isDefault) ?? list[0] ?? null;
}

/** Creates an address, or updates one when addressId is passed. The
 *  first address a customer saves becomes their default. */
export function addOrUpdateAddress(
  phone: string,
  addressData: Omit<Address, "id">,
  addressId?: string | null,
): Address[] {
  let addresses = getCustomerAddresses(getMockCustomer(phone));
  if (addressId) {
    addresses = addresses.map((a) => (a.id === addressId ? { ...a, ...addressData } : a));
  } else {
    addresses = [
      ...addresses,
      { id: "addr-" + Date.now(), isDefault: addresses.length === 0, ...addressData },
    ];
  }
  saveMockCustomer(phone, { addresses, address: undefined });
  return addresses;
}

export function setDefaultAddress(phone: string, addressId: string): Address[] {
  const addresses = getCustomerAddresses(getMockCustomer(phone)).map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  saveMockCustomer(phone, { addresses });
  return addresses;
}

export function removeAddress(phone: string, addressId: string): Address[] {
  let addresses = getCustomerAddresses(getMockCustomer(phone)).filter((a) => a.id !== addressId);
  if (addresses.length && !addresses.some((a) => a.isDefault)) {
    addresses = addresses.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
  }
  saveMockCustomer(phone, { addresses });
  return addresses;
}
