import type { DefaultCellComponentProps } from "payload";

const jalali = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function JalaliDateCell({ cellData }: DefaultCellComponentProps) {
  if (!cellData) return <span className="reyso-muted">—</span>;
  return <span className="reyso-muted">{jalali.format(new Date(cellData as string))}</span>;
}
