import { Suspense } from "react";
import { DemoGateway } from "@/components/checkout/DemoGateway";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("payDemo");

export default function PayDemoPage() {
  return (
    <Suspense>
      <DemoGateway />
    </Suspense>
  );
}
