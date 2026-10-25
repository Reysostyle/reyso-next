import "server-only";
import type { Customer as CustomerDoc } from "@/payload-types";

// The shape the storefront keeps in the browser (src/lib/customer.ts).
export type ClientAddress = {
  id: string;
  label?: string;
  province?: string;
  city?: string;
  full: string;
  postal: string;
  isDefault?: boolean;
};

export type ClientCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday?: string;
  telegram?: string;
  addresses: ClientAddress[];
  wishlist: string[];
};

export function toClientCustomer(doc: CustomerDoc): ClientCustomer {
  return {
    firstName: doc.firstName ?? undefined,
    lastName: doc.lastName ?? undefined,
    email: doc.email ?? undefined,
    birthday: doc.birthday ?? undefined,
    telegram: doc.telegram ?? undefined,
    addresses: (doc.addresses ?? []).map((a) => ({
      id: a.clientId || `addr-${a.id}`,
      label: a.label ?? undefined,
      province: a.province ?? undefined,
      city: a.city ?? undefined,
      full: a.full,
      postal: a.postal ?? "",
      isDefault: !!a.isDefault,
    })),
    wishlist: Array.isArray(doc.wishlist) ? (doc.wishlist as string[]) : [],
  };
}

const text = (v: unknown, max = 200): string | undefined =>
  typeof v === "string" ? v.trim().slice(0, max) : undefined;

/** Picks the fields a customer may change on their own record from an
 *  untrusted request body. Missing fields are left as they are. */
export function parseCustomerUpdate(body: unknown): Partial<CustomerDoc> {
  if (!body || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;
  const data: Partial<CustomerDoc> = {};

  for (const key of ["firstName", "lastName", "birthday", "telegram"] as const) {
    if (key in b) data[key] = text(b[key]) || null;
  }
  if ("email" in b) {
    const email = text(b.email);
    data.email = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  }
  if (Array.isArray(b.addresses)) {
    data.addresses = b.addresses
      .filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && !!text(a.full))
      .slice(0, 10)
      .map((a) => ({
        clientId: text(a.id, 60) || `addr-${Date.now()}`,
        label: text(a.label) || null,
        province: text(a.province) || null,
        city: text(a.city) || null,
        full: text(a.full, 1000)!,
        postal: text(a.postal, 20) || null,
        isDefault: !!a.isDefault,
      }));
  }
  if (Array.isArray(b.wishlist)) {
    data.wishlist = b.wishlist.filter((x): x is string => typeof x === "string").slice(0, 200);
  }
  return data;
}
