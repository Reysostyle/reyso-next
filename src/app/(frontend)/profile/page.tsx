import { Suspense } from "react";
import { ProfileFromQuery } from "@/components/profile/ProfileView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("profile");

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileFromQuery />
    </Suspense>
  );
}
