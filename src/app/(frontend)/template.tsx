import { PageMotion } from "@/components/layout/PageMotion";

// Remounts on every navigation, so each page gets its entrance animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}
