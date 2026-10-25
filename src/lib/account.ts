"use client";

import {
  getCustomerAddresses,
  getLoggedInPhone,
  getMockCustomer,
  customersStore,
  setCheckoutPhone,
  setVerified,
  type Customer,
} from "./customer";
import { wishlistStore } from "./wishlist";

// Customer accounts on the server (src/app/(store-api)/api/account). The
// browser keeps its copy in localStorage, as before, so pages can read it
// synchronously; this file keeps that copy and the server in step.
// Off in the GitHub Pages preview, which has no server: accounts then stay
// in the browser only, like on the old site.
export const ACCOUNTS_API = process.env.NEXT_PUBLIC_ACCOUNTS_API === "1";

export type RemoteAccount = { phone: string; customer: Customer & { wishlist: string[] } };

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string; retryAfter?: number };

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch("/api/account/" + path, {
      ...init,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: body as T };
    return {
      ok: false,
      status: res.status,
      error: body.error || "مشکلی پیش اومد. دوباره امتحان کن.",
      retryAfter: body.retryAfter,
    };
  } catch {
    return { ok: false, status: 0, error: "اتصال برقرار نشد. اینترنتت رو چک کن و دوباره امتحان کن." };
  }
}

export const sendCode = (phone: string) =>
  call<{ ok: true }>("otp", { method: "POST", body: JSON.stringify({ phone }) });

export const verifyCode = (phone: string, code: string) =>
  call<RemoteAccount>("verify", { method: "POST", body: JSON.stringify({ phone, code }) });

/** Puts the server's record in the browser copy. On login, details the
 *  visitor entered as a guest fill the gaps of a new or partial account
 *  and are sent up; on later page loads the server simply wins. */
export function adoptRemote({ phone, customer: server }: RemoteAccount, atLogin: boolean) {
  const local = getMockCustomer(phone) ?? {};
  const merged: Customer = { ...local, ...server };
  let fillFromLocal = false;
  if (atLogin) {
    for (const key of ["firstName", "lastName", "email", "birthday", "telegram"] as const) {
      if (!server[key] && local[key]) {
        merged[key] = local[key];
        fillFromLocal = true;
      }
    }
    if (!server.addresses?.length && getCustomerAddresses(local).length) {
      merged.addresses = getCustomerAddresses(local);
      fillFromLocal = true;
    }
    const guestWishlist = wishlistStore.get();
    if (!server.wishlist.length && guestWishlist.length) {
      merged.wishlist = guestWishlist;
      fillFromLocal = true;
    }
  }
  delete merged.address;
  customersStore.set({ ...customersStore.get(), [phone]: merged });
  if (fillFromLocal) pushCustomer(phone);
}

let pushing = false;
let pushAgain = false;

/** Sends the browser's copy of the logged-in customer to the server. Each
 *  request carries the whole record, so while one is in flight further
 *  changes only need one more request after it. */
export async function pushCustomer(phone: string) {
  if (!ACCOUNTS_API) return;
  if (pushing) {
    pushAgain = true;
    return;
  }
  pushing = true;
  do {
    pushAgain = false;
    if (getLoggedInPhone() !== phone) break;
    const c = getMockCustomer(phone);
    if (!c) break;
    const res = await call<RemoteAccount>("me", {
      method: "PATCH",
      // keepalive: a save right before leaving the page still arrives.
      keepalive: true,
      body: JSON.stringify({
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        birthday: c.birthday,
        telegram: c.telegram,
        addresses: getCustomerAddresses(c),
        wishlist: c.wishlist ?? [],
      }),
    });
    if (!res.ok && res.status === 401) endLocalSession();
  } while (pushAgain);
  pushing = false;
}

function endLocalSession() {
  setVerified(false);
  wishlistStore.set([]);
}

/** Restores the session from the server cookie when a page loads. */
export async function syncAccount() {
  if (!ACCOUNTS_API) return;
  const res = await call<RemoteAccount | { phone: null }>("me");
  if (!res.ok) return;
  if (res.data.phone) {
    const account = res.data as RemoteAccount;
    adoptRemote(account, false);
    setCheckoutPhone(account.phone);
    setVerified(true);
    wishlistStore.set(account.customer.wishlist);
  } else if (getLoggedInPhone()) {
    // Logged out elsewhere, or the session expired.
    endLocalSession();
  }
}

export async function logOut() {
  endLocalSession();
  if (ACCOUNTS_API) await call("logout", { method: "POST" });
}
