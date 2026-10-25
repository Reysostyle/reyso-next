import { NotFoundContent } from "@/components/pages/NotFoundContent";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("404");

export default function NotFound() {
  return <NotFoundContent />;
}
