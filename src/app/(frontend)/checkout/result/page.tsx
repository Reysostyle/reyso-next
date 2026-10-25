import { Suspense } from "react";
import { PaymentResult } from "@/components/checkout/PaymentResult";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("result");

export default function CheckoutResultPage() {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
}
