import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && key);
export const supabase = supabaseConfigured ? createBrowserClient<Database>(url as string, key as string) : null;
