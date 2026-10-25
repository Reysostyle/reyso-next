// Order statuses as the admin panel names them. Kept apart from the Orders
// collection so client components can import them.
export const ORDER_STATUSES = [
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "registered", label: "ثبت شد" },
  { value: "sewing", label: "در حال دوخت" },
  { value: "ready", label: "آماده ارسال" },
  { value: "shipped", label: "ارسال شد" },
  { value: "cancelled", label: "لغو شد" },
] as const;
