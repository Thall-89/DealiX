import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getServerIdentity } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Dashboard | DealiX", template: "%s | DealiX" } };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const identity = await getServerIdentity();
  if (!identity) redirect("/login");
  return <AppShell identity={identity}>{children}</AppShell>;
}
