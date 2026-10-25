import type { DefaultCellComponentProps } from "payload";

const LABELS: Record<string, string> = { paid: "پرداخت شده", unpaid: "پرداخت نشده", manual: "هماهنگی دستی" };

export default function PaymentCell({ cellData }: DefaultCellComponentProps) {
  const key = String(cellData ?? "unpaid");
  return <span className={`reyso-badge reyso-pay--${key}`}>{LABELS[key] ?? key}</span>;
}
