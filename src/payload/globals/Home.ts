import type { GlobalConfig } from "payload";
import { revalidateSite } from "../revalidate";

export const Home: GlobalConfig = {
  slug: "home",
  label: "صفحه اصلی",
  admin: { group: "محتوا" },
  access: { read: () => true },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidateSite(req.context);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "featured",
      label: "محصولات منتخب (به همین ترتیب در صفحه اصلی نمایش داده می‌شن)",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
  ],
};
