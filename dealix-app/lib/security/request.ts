import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database";

export function assertSameOrigin(request: NextRequest) { const origin = request.headers.get("origin"); if (!origin) return; const expected = new URL(request.url).origin; if (origin !== expected) throw new Response("Cross-origin request denied.", { status: 403 }); }
export async function requireUser(request: NextRequest) { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key) throw new Response("Supabase authentication is required for configured external integrations.", { status: 503 }); const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); if (!token || token.length > 4096) throw new Response("Sign in to use this integration.", { status: 401 }); const client = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } }); const { data, error } = await client.auth.getUser(token); if (error || !data.user) throw new Response("Your session is invalid or expired. Sign in again.", { status: 401 }); return data.user; }
