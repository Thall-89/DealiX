import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { MarketIntelligenceSnapshot } from "@/lib/marketIntelligence/types";

function safeRecordValue(value: unknown, depth = 0): boolean {
  if (depth > 12 || value === null || typeof value === "boolean") return depth <= 12;
  if (typeof value === "string") return value.length <= 20_000;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 2_000 && value.every((item) => safeRecordValue(item, depth + 1));
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).every(([key, item]) => !["__proto__", "prototype", "constructor"].includes(key) && key.length <= 200 && safeRecordValue(item, depth + 1));
  return false;
}

const recordSchema = z.object({ id: z.string().trim().min(1).max(200) }).passthrough().superRefine((value, context) => {
  if (!safeRecordValue(value)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Record contains unsupported data." });
});
const snapshotSchema = z.object({
  savedDealSearches: z.array(recordSchema).max(250),
  dealOpportunities: z.array(recordSchema).max(2_000),
  watchlist: z.array(recordSchema).max(500),
  dealAlerts: z.array(recordSchema).max(2_000),
  notifications: z.array(recordSchema).max(2_000),
  preferences: z.object({ dealAlertFrequency: z.string().max(80), minimumTargetProfit: z.number().finite().min(0).max(1_000_000), preferredParts: z.array(z.string().trim().min(1).max(100)).max(100), emailAlerts: z.boolean(), discordAlerts: z.boolean() }).strict(),
}).strict();

const tables = {
  savedDealSearches: "saved_searches",
  dealOpportunities: "marketplace_results",
  watchlist: "watchlist_items",
  dealAlerts: "deal_alerts",
  notifications: "notifications",
} as const;

type Collection = keyof typeof tables;
type PersistedRecord = { client_key: string | null; data: unknown };

function rowData(rows: PersistedRecord[]) { return rows.flatMap((row) => recordSchema.safeParse(row.data).success ? [row.data] : []); }

export async function loadMarketIntelligence(userId: string): Promise<MarketIntelligenceSnapshot | null> {
  const client = createSupabaseAdminClient() as unknown as SupabaseClient;
  const entries = await Promise.all(Object.values(tables).map(async (table) => client.from(table).select("client_key,data").eq("user_id", userId).order("updated_at", { ascending: false })));
  if (entries.some((entry) => entry.error)) throw new Error("Could not load Market Intelligence data.");
  const [searches, opportunities, watchlist, alerts, notifications] = entries.map((entry) => rowData((entry.data ?? []) as PersistedRecord[]));
  const { data: setting, error } = await client.from("app_settings").select("settings").eq("user_id", userId).maybeSingle();
  if (error) throw new Error("Could not load Market Intelligence preferences.");
  const settings = (setting?.settings ?? {}) as Record<string, unknown>;
  const result = snapshotSchema.safeParse({
    savedDealSearches: searches, dealOpportunities: opportunities, watchlist, dealAlerts: alerts, notifications,
    preferences: {
      dealAlertFrequency: typeof settings.dealAlertFrequency === "string" ? settings.dealAlertFrequency : "Daily",
      minimumTargetProfit: typeof settings.minimumTargetProfit === "number" ? settings.minimumTargetProfit : 0,
      preferredParts: Array.isArray(settings.preferredParts) ? settings.preferredParts.filter((part): part is string => typeof part === "string") : [],
      emailAlerts: settings.emailAlerts === true, discordAlerts: settings.discordAlerts === true,
    },
  });
  return result.success ? result.data as unknown as MarketIntelligenceSnapshot : null;
}

async function replaceCollection(client: SupabaseClient, table: string, userId: string, records: Array<{ id: string }>) {
  const keys = records.map((record) => record.id);
  // Never build a PostgREST filter from a browser-controlled key. Fetch the
  // small, user-owned key set first, then delete stale rows by their UUID.
  const { data: existing, error: existingError } = await client.from(table).select("id,client_key").eq("user_id", userId);
  if (existingError) throw new Error("Could not reconcile Market Intelligence records.");
  const staleIds = (existing ?? []).filter((row) => !row.client_key || !keys.includes(row.client_key)).map((row) => row.id);
  if (staleIds.length) {
    const { error: deleteError } = await client.from(table).delete().in("id", staleIds).eq("user_id", userId);
    if (deleteError) throw new Error("Could not reconcile Market Intelligence records.");
  }
  if (!records.length) return;
  const { error } = await client.from(table).upsert(records.map((record) => ({ user_id: userId, client_key: record.id, data: record as unknown as Json })), { onConflict: "user_id,client_key" });
  if (error) throw new Error("Could not save Market Intelligence records.");
}

export async function saveMarketIntelligence(userId: string, input: unknown) {
  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid Market Intelligence data.");
  const snapshot = parsed.data;
  const client = createSupabaseAdminClient() as unknown as SupabaseClient;
  await Promise.all((Object.keys(tables) as Collection[]).map((key) => replaceCollection(client, tables[key], userId, snapshot[key])));
  const { data: existingSettings, error: existingSettingsError } = await client.from("app_settings").select("settings").eq("user_id", userId).maybeSingle();
  if (existingSettingsError) throw new Error("Could not save Market Intelligence preferences.");
  const settings = { ...((existingSettings?.settings ?? {}) as Record<string, Json>), ...snapshot.preferences as unknown as Record<string, Json> };
  const { error } = await client.from("app_settings").upsert({ user_id: userId, settings }, { onConflict: "user_id" });
  if (error) throw new Error("Could not save Market Intelligence preferences.");
}
