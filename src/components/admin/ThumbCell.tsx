/* eslint-disable @next/next/no-img-element */
import type { DefaultServerCellComponentProps } from "payload";

type MediaRef = number | { id: number; url?: string | null } | null | undefined;

// First product photo in the products list.
export default async function ThumbCell({ rowData, payload }: DefaultServerCellComponentProps) {
  const first = (rowData?.images as MediaRef[] | undefined)?.[0];
  let url = typeof first === "object" ? first?.url : undefined;
  if (typeof first === "number") {
    const media = await payload.findByID({ collection: "media", id: first, depth: 0 }).catch(() => null);
    url = media?.url;
  }
  if (!url) return <span className="reyso-thumb reyso-thumb--empty" />;
  return <img className="reyso-thumb" src={url} alt="" loading="lazy" />;
}
