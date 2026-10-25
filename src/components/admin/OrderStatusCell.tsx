import type { DefaultCellComponentProps } from "payload";
import { ORDER_STATUSES } from "@/payload/collections/Orders";

export default function OrderStatusCell({ cellData }: DefaultCellComponentProps) {
  const status = ORDER_STATUSES.find((s) => s.value === cellData);
  return (
    <span className={`reyso-badge reyso-status--${cellData}`}>{status?.label ?? String(cellData ?? "")}</span>
  );
}
