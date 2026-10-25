// Order production steps, shared by the profile page and order tracking
// so both always show the same labels. Staff set the status in the admin panel.

export const ORDER_STATUS_STEPS = [
  { key: "registered", label: "سفارش ثبت شد", icon: "ri-file-list-3-line" },
  { key: "sewing", label: "در حال دوخت", icon: "ri-scissors-cut-line" },
  { key: "ready", label: "اتمام دوخت و آماده ارسال", icon: "ri-checkbox-circle-line" },
  { key: "shipped", label: "ارسال شد", icon: "ri-truck-line" },
] as const;

export type OrderStatus = (typeof ORDER_STATUS_STEPS)[number]["key"];

export function orderStatusIndex(statusKey: string | undefined): number {
  return ORDER_STATUS_STEPS.findIndex((s) => s.key === statusKey);
}

/** "is-done" / "is-current" / "" for each step. The last step (shipped)
 *  is a finished state, so it reads as done rather than in progress. */
export function stepStates(statusKey: string | undefined): string[] {
  const current = orderStatusIndex(statusKey);
  const isLast = current === ORDER_STATUS_STEPS.length - 1;
  return ORDER_STATUS_STEPS.map((_, i) =>
    i < current ? "is-done" : i === current ? (isLast ? "is-done" : "is-current") : "",
  );
}

export type TrackLookup = {
  found: boolean;
  status?: { production: string; trackingCode?: string };
  /** ISO time each step was reached, by status key (server orders only). */
  dates?: Record<string, string>;
};
