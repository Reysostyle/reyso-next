import { ProfileView } from "@/components/profile/ProfileView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("profile");

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const { new_order } = await searchParams;
  return <ProfileView newOrderId={typeof new_order === "string" ? new_order : null} />;
}
