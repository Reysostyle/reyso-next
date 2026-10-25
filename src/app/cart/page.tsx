import { CartView } from "@/components/checkout/CartView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("cart");

export default function CartPage() {
  return <CartView />;
}
