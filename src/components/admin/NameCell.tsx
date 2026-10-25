import Link from "next/link";
import type { DefaultCellComponentProps } from "payload";

// The photo is the first column, so the name needs its own link to the product.
export default function NameCell({ cellData, rowData, collectionSlug }: DefaultCellComponentProps) {
  return (
    <Link className="reyso-name-link" href={`/admin/collections/${collectionSlug}/${rowData.id}`}>
      {String(cellData ?? "")}
    </Link>
  );
}
