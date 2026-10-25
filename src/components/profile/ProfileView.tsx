"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AddressFields, NAME_PATTERN, focusField, useAddressForm } from "@/components/checkout/AddressFields";
import { ProductCard } from "@/components/product/ProductCard";
import { REYSO_CONFIG } from "@/lib/config";
import {
  type Address,
  CHECKOUT_PHONE_KEY,
  CHECKOUT_VERIFIED_KEY,
  addOrUpdateAddress,
  getCustomerAddresses,
  removeAddress,
  saveMockCustomer,
  setDefaultAddress,
  setVerified,
  useCustomer,
} from "@/lib/customer";
import { useRaw } from "@/lib/local-store";
import { type Order, getCustomerOrders, lookupOrderRemote } from "@/lib/orders";
import { ORDER_STATUS_STEPS, orderStatusIndex, stepStates } from "@/lib/order-status";
import { PRODUCTS, formatToman } from "@/lib/products";
import { useHydrated } from "@/lib/use-hydrated";
import { saveWishlist, useWishlist } from "@/lib/wishlist";

/* eslint-disable @next/next/no-img-element */

type Tab = "orders" | "addresses" | "wishlist";

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

/* ---------- orders ---------- */

function OrderCard({ order, liveStatus }: { order: Order; liveStatus?: string }) {
  const status = liveStatus || order.status || "registered";
  const index = orderStatusIndex(status);
  const totalSpanPercent = 75; // matches right/left 12.5% in the CSS
  const fillPercent =
    ORDER_STATUS_STEPS.length > 1 ? (index / (ORDER_STATUS_STEPS.length - 1)) * totalSpanPercent : 0;
  const states = stepStates(status);
  const first = order.items[0];

  return (
    <div className="profile-order-card" data-order-id={order.orderId}>
      <div className="profile-order-top">
        <img
          className="profile-order-thumb"
          src={first?.image || "/images/hero1.jpg"}
          alt={first?.name ?? ""}
        />
        <div className="profile-order-top-info">
          <div className="profile-order-id">{order.orderId}</div>
          <div className="profile-order-date">{formatOrderDate(order.createdAt)}</div>
          <div className="profile-order-total">{formatToman(order.total)}</div>
        </div>
      </div>
      <div className="profile-order-items">
        {order.items.map((it) => it.name + " ×" + it.qty.toLocaleString("fa-IR")).join("، ")}
      </div>
      <div className="profile-order-status">
        <div className="profile-order-status-line"></div>
        <div className="profile-order-status-fill" style={{ width: fillPercent + "%" }}></div>
        {ORDER_STATUS_STEPS.map((step, i) => (
          <div key={step.key} className={"profile-order-step " + states[i]}>
            <span className="profile-order-step-dot"></span>
            <span className="profile-order-step-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPanel({ phone }: { phone: string }) {
  // Read once on mount; orders only change on the review step.
  const [orders] = useState(() => getCustomerOrders(phone));
  const [live, setLive] = useState<Record<string, string>>({});

  // The local copy only knows the status at checkout time; ask the
  // tracking endpoint for each order's current one when configured.
  useEffect(() => {
    if (!REYSO_CONFIG.TRACK_LOOKUP_URL) return;
    let cancelled = false;
    for (const order of orders) {
      if (!order.orderId) continue;
      const id = order.orderId;
      lookupOrderRemote(id)
        .then((data) => {
          if (!cancelled && data.found && data.status)
            setLive((m) => ({ ...m, [id]: data.status!.production }));
        })
        .catch(() => {
          // network hiccup: the locally cached status stays shown
        });
    }
    return () => {
      cancelled = true;
    };
  }, [orders]);

  return (
    <>
      <div className="profile-orders-list" id="profile-orders-list">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            liveStatus={order.orderId ? live[order.orderId] : undefined}
          />
        ))}
      </div>
      <div className="profile-empty" id="profile-orders-empty" hidden={orders.length > 0}>
        <i className="ri-shopping-bag-3-line"></i>
        <p>هنوز سفارشی ثبت نکردی.</p>
        <Link href="/shop">مشاهده محصولات</Link>
      </div>
    </>
  );
}

/* ---------- addresses ---------- */

const PA_IDS = {
  province: "pa-province",
  city: "pa-city",
  cityOther: "pa-city-other",
  address: "pa-address",
  postal: "pa-postal",
};

function AddressesPanel({ phone, addresses }: { phone: string; addresses: Address[] }) {
  const form = useAddressForm();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function open(addr: Address | null) {
    form.reset(addr);
    setEditId(addr?.id ?? null);
    setLabel(addr?.label ?? "");
    setFormOpen(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function close() {
    setFormOpen(false);
    form.reset();
    setEditId(null);
    setLabel("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = form.validate();
    if (invalid) {
      focusField(PA_IDS, invalid, form);
      return;
    }
    addOrUpdateAddress(phone, { label: label.trim() || "آدرس", ...form.value() }, editId);
    close();
  }

  return (
    <>
      <div className="profile-addresses-list" id="profile-addresses-list">
        {addresses.map((addr) => (
          <div key={addr.id} className={"profile-address-card" + (addr.isDefault ? " is-default" : "")}>
            <div className="profile-address-label">
              <i className="ri-map-pin-line"></i> {addr.label || "آدرس"}
              {addr.isDefault && <span className="profile-address-default-badge">پیش‌فرض</span>}
            </div>
            <div className="profile-address-text">
              {[addr.province, addr.city, addr.full].filter(Boolean).join("، ")}، کدپستی {addr.postal}
            </div>
            <div className="profile-address-actions">
              <button type="button" className="profile-address-edit" onClick={() => open(addr)}>
                <i className="ri-pencil-line"></i> ویرایش
              </button>
              {!addr.isDefault && (
                <button
                  type="button"
                  className="profile-address-set-default"
                  onClick={() => setDefaultAddress(phone, addr.id)}
                >
                  انتخاب به‌عنوان پیش‌فرض
                </button>
              )}
              <button
                type="button"
                className="profile-address-delete"
                onClick={() => removeAddress(phone, addr.id)}
              >
                <i className="ri-delete-bin-line"></i> حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="profile-add-btn"
        id="profile-add-address-btn"
        onClick={() => open(null)}
      >
        <i className="ri-add-line"></i> افزودن آدرس جدید
      </button>
      <form
        className="profile-address-form"
        id="profile-address-form"
        noValidate
        hidden={!formOpen}
        ref={formRef}
        onSubmit={submit}
      >
        <label htmlFor="pa-label">عنوان آدرس (اختیاری)</label>
        <input
          type="text"
          id="pa-label"
          className="auth-text-input"
          placeholder="مثلاً خانه، محل کار"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <AddressFields form={form} ids={PA_IDS} />
        <div className="profile-address-form-actions">
          <button type="submit" className="auth-submit-btn">
            ذخیره آدرس
          </button>
          <button type="button" className="profile-cancel-btn" id="profile-address-cancel" onClick={close}>
            انصراف
          </button>
        </div>
      </form>
      <div className="profile-empty" id="profile-addresses-empty" hidden={addresses.length > 0}>
        <i className="ri-map-pin-line"></i>
        <p>هنوز آدرسی ثبت نکردی.</p>
      </div>
    </>
  );
}

/* ---------- wishlist ---------- */

function WishlistPanel() {
  const ids = useWishlist();
  const matches = PRODUCTS.filter((p) => ids.includes(p.id));
  return (
    <>
      <div className="product-grid" id="profile-wishlist-grid">
        {matches.map((p) => (
          <ProductCard key={p.id} product={p} wishlistLabel="حذف از علاقه‌مندی‌ها" />
        ))}
      </div>
      <div className="profile-empty" id="profile-wishlist-empty" hidden={matches.length > 0}>
        <i className="ri-heart-line"></i>
        <p>لیست علاقه‌مندی‌هات خالیه.</p>
        <Link href="/shop">مشاهده محصولات</Link>
      </div>
    </>
  );
}

/* ---------- head: name + edit + logout ---------- */

function ProfileHead({ phone, firstName, lastName }: { phone: string; firstName: string; lastName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [invalid, setInvalid] = useState({ first: false, last: false });
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setFirst(firstName);
    setLast(lastName);
    setInvalid({ first: false, last: false });
    setEditing(true);
    requestAnimationFrame(() => firstRef.current?.focus());
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const f = first.trim();
    const l = last.trim();
    const firstOk = f.length > 0 && NAME_PATTERN.test(f);
    const lastOk = l.length > 0 && NAME_PATTERN.test(l);
    setInvalid({ first: !firstOk, last: !lastOk });
    if (!firstOk || !lastOk) {
      (firstOk ? lastRef : firstRef).current?.focus();
      return;
    }
    saveMockCustomer(phone, { firstName: f, lastName: l });
    setEditing(false);
  }

  function logout() {
    setVerified(false);
    // Only the visible list resets; the account keeps its own copy and
    // it comes back on the next login.
    saveWishlist([]);
    router.push("/");
  }

  const showError = editing && (invalid.first || invalid.last);

  return (
    <>
      <div className="profile-head">
        <div className="profile-avatar">
          <i className="ri-user-3-line"></i>
        </div>
        <div className="profile-head-info" id="profile-name-view" hidden={editing}>
          <h1 id="profile-name">{firstName + " " + lastName}</h1>
          <bdi id="profile-phone" dir="ltr">
            {phone}
          </bdi>
        </div>
        <form
          className="profile-name-edit-form"
          id="profile-name-edit-form"
          hidden={!editing}
          noValidate
          onSubmit={save}
        >
          <input
            type="text"
            id="profile-edit-first-name"
            ref={firstRef}
            className={"profile-name-edit-input" + (invalid.first ? " is-invalid" : "")}
            placeholder="نام"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            type="text"
            id="profile-edit-last-name"
            ref={lastRef}
            className={"profile-name-edit-input" + (invalid.last ? " is-invalid" : "")}
            placeholder="نام‌خانوادگی"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
          <button type="submit" className="profile-name-save-btn" aria-label="ذخیره">
            <i className="ri-check-line"></i>
          </button>
          <button
            type="button"
            className="profile-name-cancel-btn"
            id="profile-name-cancel-btn"
            aria-label="انصراف"
            onClick={() => setEditing(false)}
          >
            <i className="ri-close-line"></i>
          </button>
        </form>
        <button
          type="button"
          className="profile-edit-btn"
          id="profile-edit-name-btn"
          hidden={editing}
          onClick={startEdit}
        >
          <i className="ri-pencil-line"></i> ویرایش نام
        </button>
        <button type="button" className="profile-logout-btn" id="profile-logout-btn" onClick={logout}>
          <i className="ri-logout-box-r-line"></i> خروج
        </button>
      </div>
      <p className="auth-error profile-name-error" id="profile-name-error" hidden={!showError}>
        نام رو درست وارد کن (بدون عدد).
      </p>
    </>
  );
}

/* ---------- page ---------- */

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: "orders", icon: "ri-shopping-bag-3-line", label: "سفارش‌ها" },
  { key: "addresses", icon: "ri-map-pin-line", label: "آدرس‌ها" },
  { key: "wishlist", icon: "ri-heart-line", label: "علاقه‌مندی‌ها" },
];

export function ProfileView({ newOrderId }: { newOrderId: string | null }) {
  const hydrated = useHydrated();
  const phone = useRaw(CHECKOUT_PHONE_KEY);
  const verified = useRaw(CHECKOUT_VERIFIED_KEY) === "1";
  const customer = useCustomer(phone);
  const [tab, setTab] = useState<Tab>("orders");
  const loggedIn = !!(phone && verified && customer?.firstName);

  // Drop ?new_order from the URL so a refresh or a shared link doesn't
  // keep showing the banner for an order that's no longer new.
  useEffect(() => {
    if (!newOrderId) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("new_order");
    window.history.replaceState(window.history.state, "", url);
  }, [newOrderId]);

  return (
    <section className="profile-section">
      <div className="container">
        <p className="pd-crumbs">
          <Link href="/">خانه</Link> / <span>پروفایل من</span>
        </p>
        <div className="profile-guest" id="profile-guest" hidden={!hydrated || loggedIn}>
          <i className="ri-user-3-line"></i>
          <h1>هنوز وارد نشدی</h1>
          <p>برای دیدن سفارش‌ها، آدرس‌ها و علاقه‌مندی‌هات، اول با شماره موبایلت وارد شو.</p>
          <Link href="/checkout/phone" className="profile-guest-btn">
            ورود / ثبت‌نام
            <i className="ri-arrow-left-line"></i>
          </Link>
        </div>
        {hydrated && loggedIn && (
          <div id="profile-app">
            <ProfileHead
              phone={phone!}
              firstName={customer!.firstName!}
              lastName={customer!.lastName ?? ""}
            />
            {newOrderId && (
              <div className="profile-new-order-banner" id="profile-new-order-banner">
                <i className="ri-checkbox-circle-line"></i>
                <span>
                  سفارشت با کد <strong id="profile-new-order-id">{newOrderId}</strong> با موفقیت ثبت شد.
                  وضعیتش رو از همینجا می‌تونی دنبال کنی.
                </span>
              </div>
            )}
            <div className="profile-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={"profile-tab" + (tab === t.key ? " is-active" : "")}
                  data-tab={t.key}
                  onClick={() => setTab(t.key)}
                >
                  <i className={t.icon}></i> {t.label}
                </button>
              ))}
            </div>
            <div className={"profile-panel" + (tab === "orders" ? " is-active" : "")} data-panel="orders">
              <OrdersPanel phone={phone!} />
            </div>
            <div
              className={"profile-panel" + (tab === "addresses" ? " is-active" : "")}
              data-panel="addresses"
            >
              <AddressesPanel phone={phone!} addresses={getCustomerAddresses(customer)} />
            </div>
            <div className={"profile-panel" + (tab === "wishlist" ? " is-active" : "")} data-panel="wishlist">
              <WishlistPanel />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ProfileFromQuery() {
  // Kept in state: the URL is cleaned right after, which would
  // otherwise hide the banner straight away.
  const [newOrderId] = useState(useSearchParams().get("new_order"));
  return <ProfileView newOrderId={newOrderId} />;
}
