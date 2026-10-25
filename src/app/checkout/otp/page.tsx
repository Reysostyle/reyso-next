import { OtpStep } from "@/components/checkout/OtpStep";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("otp");

export default function CheckoutOtpPage() {
  return <OtpStep />;
}
