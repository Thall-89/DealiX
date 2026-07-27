import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getServerUser, supabaseServerConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Dashboard | DealiX", template: "%s | DealiX" } };

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (supabaseServerConfigured && !(await getServerUser())) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
