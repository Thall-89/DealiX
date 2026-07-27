"use client";
import { supabase } from "@/lib/supabase/client";
export async function secureRequestHeaders() { const { data } = await supabase?.auth.getSession() ?? { data: { session: null } }; if (!data.session?.access_token) throw new Error("Sign in to use this integration."); return { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }; }
