import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listMarketplaceProviders } from "@/lib/marketplaces";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { requireUser } from "@/lib/security/request";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { try { const user = await requireUser(request); await enforceRateLimit("recon-status", user.id, 60, 60_000); const client = createSupabaseAdminClient() as unknown as SupabaseClient; const { data, error } = await client.from("monitor_runs").select("data").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(); if (error) throw error; return NextResponse.json({ active: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32), lastSweep: data?.data ?? null, nextSweepMinutes: 5, providers: listMarketplaceProviders() }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { if (error instanceof Response) return error; return NextResponse.json({ error: "Could not load Recon status." }, { status: 500, headers: { "Cache-Control": "no-store" } }); } }
