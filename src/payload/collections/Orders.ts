import type { CollectionConfig } from "payload";

export const ORDER_STATUSES = [
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "registered", label: "ثبت شد" },
  { value: "sewing", label: "در حال دوخت" },
  { value: "ready", label: "آماده ارسال" },
  { value: "shipped", label: "ارسال شد" },
  { value: "cancelled", label: "لغو شد" },
] as const;

// Orders are created by the storefront (src/app/(store-api)/api/orders),
// which prices them from the catalogue. Staff change the status here.
export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: "سفارش", plural: "سفارش‌ها" },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customerName", "total", "status", "paymentStatus", "createdAt"],
    listSearchableFields: ["orderNumber", "phone", "customerName"],
    group: "فروشگاه",
  },
  defaultSort: "-createdAt",
  access: {
    read: ({ req }) => !!req.user,
    create: () => false,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "orderNumber",
          label: "کد سفارش",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true },
        },
        {
          name: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          defaultValue: "pending_payment",
          index: true,
          options: ORDER_STATUSES.map((s) => ({ ...s })),
          admin: { components: { Cell: "/components/admin/OrderStatusCell" } },
        },
      ],
    },
    {
      name: "trackingCode",
      label: "کد رهگیری پست",
      type: "text",
      admin: { description: "بعد از ارسال وارد کنید تا مشتری در صفحه پیگیری ببیند." },
    },
    {
      type: "collapsible",
      label: "مشتری و ارسال",
      fields: [
        {
          name: "customer",
          label: "حساب مشتری",
          type: "relationship",
          relationTo: "customers",
          admin: { readOnly: true },
        },
        {
          type: "row",
          fields: [
            { name: "customerName", label: "نام گیرنده", type: "text", required: true },
            { name: "phone", label: "موبایل", type: "text", required: true, index: true },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "province", label: "استان", type: "text" },
            { name: "city", label: "شهر", type: "text" },
            { name: "postal", label: "کد پستی", type: "text" },
          ],
        },
        { name: "address", label: "آدرس", type: "textarea", required: true },
        {
          type: "row",
          fields: [
            { name: "shipping", label: "روش ارسال", type: "text", defaultValue: "post" },
            { name: "telegram", label: "تلگرام", type: "text" },
          ],
        },
        { name: "notes", label: "یادداشت مشتری", type: "textarea" },
      ],
    },
    {
      name: "items",
      label: "اقلام",
      type: "array",
      required: true,
      minRows: 1,
      admin: { readOnly: true, components: { RowLabel: "/components/admin/OrderItemLabel" } },
      labels: { singular: "قلم", plural: "اقلام" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "product", label: "محصول", type: "relationship", relationTo: "products" },
            { name: "productSlug", type: "text", required: true, admin: { hidden: true } },
            { name: "name", label: "نام", type: "text", required: true },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "size", label: "سایز", type: "text", required: true },
            { name: "color", label: "رنگ", type: "text", required: true },
            { name: "qty", label: "تعداد", type: "number", required: true, min: 1 },
            {
              name: "unitPrice",
              label: "قیمت واحد",
              type: "number",
              required: true,
              admin: { components: { afterInput: ["/components/admin/PriceHint"] } },
            },
          ],
        },
        { name: "image", type: "text", admin: { hidden: true } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "subtotal",
          label: "جمع کالاها",
          type: "number",
          required: true,
          admin: { readOnly: true, components: { afterInput: ["/components/admin/PriceHint"] } },
        },
        { name: "discountCode", label: "کد تخفیف", type: "text", admin: { readOnly: true } },
        {
          name: "discountAmount",
          label: "تخفیف",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true },
        },
        {
          name: "shippingCost",
          label: "هزینه ارسال",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: "total",
      label: "مبلغ نهایی (تومان)",
      type: "number",
      required: true,
      admin: {
        readOnly: true,
        components: { Cell: "/components/admin/PriceCell", afterInput: ["/components/admin/PriceHint"] },
      },
    },
    {
      name: "paymentStatus",
      label: "پرداخت",
      type: "select",
      required: true,
      defaultValue: "unpaid",
      index: true,
      options: [
        { value: "unpaid", label: "پرداخت نشده" },
        { value: "paid", label: "پرداخت شده" },
        { value: "manual", label: "هماهنگی دستی" },
      ],
      admin: { position: "sidebar", components: { Cell: "/components/admin/PaymentCell" } },
    },
    {
      name: "payment",
      label: "جزئیات پرداخت",
      type: "group",
      admin: { position: "sidebar", readOnly: true },
      fields: [
        { name: "gateway", label: "درگاه", type: "text" },
        { name: "authority", label: "شناسه تراکنش", type: "text", index: true },
        { name: "refId", label: "کد پیگیری بانک", type: "text" },
        { name: "cardPan", label: "کارت", type: "text" },
        {
          name: "paidAt",
          label: "زمان پرداخت",
          type: "date",
          admin: { components: { Field: "/components/admin/JalaliDateField" } },
        },
      ],
    },
    {
      // Payload's own timestamp, redeclared for a Persian-date list column.
      name: "createdAt",
      label: "تاریخ",
      type: "date",
      index: true,
      admin: { hidden: true, components: { Cell: "/components/admin/JalaliDateCell" } },
    },
  ],
};
