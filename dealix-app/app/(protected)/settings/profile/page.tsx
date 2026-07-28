import { PageHeader } from "@/components/PageHeader";
import { ProfileSettings } from "@/components/ProfileSettings";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return <div className="space-y-6"><PageHeader eyebrow="Account" title="Profile" description="Control how DealiX addresses you and how your workspace looks." /><ProfileSettings /></div>;
}
