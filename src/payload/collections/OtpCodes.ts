import type { CollectionConfig } from "payload";

// One row per SMS code sent. Only the hash of the code is stored. The rows
// also drive rate limits (per phone and per IP), so they're kept for a day.
export const OtpCodes: CollectionConfig = {
  slug: "otp-codes",
  labels: { singular: "کد ورود", plural: "کدهای ورود" },
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "phone", type: "text", required: true, index: true },
    { name: "codeHash", type: "text", required: true },
    { name: "ip", type: "text", index: true },
    { name: "expiresAt", type: "date", required: true },
    { name: "attempts", type: "number", defaultValue: 0 },
    { name: "used", type: "checkbox", defaultValue: false },
  ],
};
