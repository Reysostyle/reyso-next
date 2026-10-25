import type { DefaultCellComponentProps } from "payload";

export default function PublishedCell({ cellData }: DefaultCellComponentProps) {
  return cellData ? (
    <span className="reyso-badge reyso-badge--on">در سایت</span>
  ) : (
    <span className="reyso-badge reyso-badge--off">پنهان</span>
  );
}
