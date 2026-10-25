import { ReviewStep } from "@/components/checkout/ReviewStep";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("review");

export default function CheckoutReviewPage() {
  return <ReviewStep />;
}
