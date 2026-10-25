import { DetailsStep } from "@/components/checkout/DetailsStep";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("details");

export default function CheckoutDetailsPage() {
  return <DetailsStep />;
}
