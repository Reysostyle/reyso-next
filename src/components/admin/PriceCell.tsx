import type { DefaultCellComponentProps } from "payload";
import { formatToman } from "@/lib/format";

// List column: 2950000 -> ۲٬۹۵۰٬۰۰۰ تومان
export default function PriceCell({ cellData }: DefaultCellComponentProps) {
  if (typeof cellData !== "number") return <span className="reyso-muted">—</span>;
  return <span className="reyso-price">{formatToman(cellData)}</span>;
}
