import { PhoneStep } from "@/components/checkout/PhoneStep";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("phone");

export default function CheckoutPhonePage() {
  return <PhoneStep />;
}
