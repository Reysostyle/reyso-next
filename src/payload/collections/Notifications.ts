import type { CollectionConfig } from "payload";

// A log of every SMS and Telegram message sent about an order, shown on
// the order's page. Written by src/payload/hooks/orderNotifications.ts.
export const Notifications: CollectionConfig = {
  slug: "notifications",
  labels: { singular: "پیام", plural: "پیام‌های ارسالی" },
  admin: {
    hidden: true,
    useAsTitle: "text",
    defaultColumns: ["channel", "text", "result", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: {
    read: ({ req }) => !!req.user,
    create: () => false,
    update: () => false,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: "order", label: "سفارش", type: "relationship", relationTo: "orders", index: true },
    {
      name: "channel",
      label: "راه ارسال",
      type: "select",
      required: true,
      options: [
        { value: "sms", label: "پیامک مشتری" },
        { value: "telegram", label: "تلگرام فروشگاه" },
      ],
    },
    { name: "to", label: "گیرنده", type: "text" },
    { name: "text", label: "متن", type: "textarea", required: true },
    {
      name: "result",
      label: "نتیجه",
      type: "select",
      required: true,
      options: [
        { value: "sent", label: "ارسال شد" },
        { value: "failed", label: "خطا" },
        { value: "not_configured", label: "ارسال نشد (تنظیم نشده)" },
      ],
    },
    { name: "error", label: "خطا", type: "text" },
    {
      name: "createdAt",
      label: "زمان",
      type: "date",
      admin: { hidden: true, components: { Cell: "/components/admin/JalaliDateCell" } },
    },
  ],
};
