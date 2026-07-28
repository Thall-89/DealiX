import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase server credentials are not configured.");
  return createClient<Database>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export const supabaseServerConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function createSupabaseServerClient() {
  if (!supabaseServerConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
}

export async function getServerUser() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

export async function getServerIdentity() {
  const user = await getServerUser();
  if (!user?.email) return null;
  const client = await createSupabaseServerClient();
  const { data: profile } = client ? await client.from("profiles").select("display_name").eq("id", user.id).maybeSingle() : { data: null };
  return { userId: user.id, email: user.email, displayName: profile?.display_name?.trim() || user.email };
}
