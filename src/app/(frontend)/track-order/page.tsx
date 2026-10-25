import { TrackOrderView } from "@/components/pages/TrackOrderView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("track");

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
