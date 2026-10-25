import { EducationView } from "@/components/pages/EducationView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("education", "/education");

export default function EducationPage() {
  return <EducationView />;
}
