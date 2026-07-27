import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { dealFromNormalizedListing } from "@/lib/dealDiscovery";
import { scoreDeal } from "@/lib/dealScoring";
import { applySearchTargets, matchSavedSearch, qualifiesForAlert } from "@/lib/dealMatching";
import { getMarketplaceProvider } from "@/lib/marketplaces";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { DealOpportunity, SavedDealSearch } from "@/types";
import type { Json } from "@/types/database";

type SavedRow = { user_id: string; data: SavedDealSearch };
function activeSearch(value: unknown): value is SavedDealSearch { return Boolean(value && typeof value === "object" && (value as SavedDealSearch).active && typeof (value as SavedDealSearch).id === "string" && typeof (value as SavedDealSearch).terms === "string"); }

export async function runReconSweep() {
  const client = createSupabaseAdminClient() as unknown as SupabaseClient;
  const { data, error } = await client.from("saved_searches").select("user_id,data").eq("data->>active", "true").limit(100);
  if (error) throw new Error("Could not load active Recon profiles.");
  const grouped = new Map<string, SavedDealSearch[]>();
  (data ?? []).filter((row): row is SavedRow => activeSearch(row.data)).forEach((row) => grouped.set(row.user_id, [...(grouped.get(row.user_id) ?? []), row.data]));
  let usersScanned = 0; let listingsAnalyzed = 0; let targetsFound = 0; let alertsCreated = 0;
  for (const [userId, profiles] of grouped) {
    const { data: locked } = await client.rpc("acquire_recon_scan_lock", { target_user_id: userId, lock_seconds: 240 });
    if (!locked) continue;
    usersScanned += 1; const startedAt = new Date().toISOString();
    try {
      const { data: stored } = await client.from("marketplace_results").select("client_key,data").eq("user_id", userId).limit(2_000);
      const existing = new Map((stored ?? []).flatMap((row) => row.client_key && row.data ? [[row.client_key, row.data as DealOpportunity] as const] : []));
      const seen = new Map<string, DealOpportunity>();
      for (const profile of profiles.slice(0, 20)) {
        const provider = profile.marketplace === "eBay" || profile.marketplace === "All" ? getMarketplaceProvider("ebay") : undefined;
        if (!provider || !provider.status().configured) continue;
        const page = await provider.search({ queries: [profile.terms || profile.category], maxPrice: profile.maximumItemPrice, category: profile.category, condition: profile.condition, limit: 30 });
        listingsAnalyzed += page.listings.length;
        page.listings.forEach((listing) => { const candidate = applySearchTargets(dealFromNormalizedListing(listing), profile); if (!matchSavedSearch(candidate, profile).included || !qualifiesForAlert(candidate, profile).passed) return; const prior = existing.get(candidate.id); seen.set(candidate.id, prior ? { ...candidate, saved: prior.saved, dismissed: prior.dismissed, compatibleBuildIds: prior.compatibleBuildIds, offer: prior.offer, targetPrice: prior.targetPrice, estimatedResaleValue: prior.estimatedResaleValue, estimatedSellingFees: prior.estimatedSellingFees, estimatedSellerShipping: prior.estimatedSellerShipping, dateFound: prior.dateFound, lastChecked: new Date().toISOString() } : candidate); });
      }
      const opportunities = [...seen.values()]; const newTargets = opportunities.filter((target) => !existing.has(target.id) && isHighValue(target));
      listingsAnalyzed += opportunities.length; targetsFound += newTargets.length;
      if (opportunities.length) { const { error: saveError } = await client.from("marketplace_results").upsert(opportunities.map((target) => ({ user_id: userId, client_key: target.id, data: target as unknown as Json })), { onConflict: "user_id,client_key" }); if (saveError) throw saveError; }
      if (newTargets.length && profiles.some((profile) => profile.notificationEnabled)) { const notification = newTargets.length === 1 ? notificationFor(newTargets[0]) : { id: `recon-${Date.now()}`, title: `${newTargets.length} new Recon targets acquired`, description: "New high-confidence opportunities are ready for review.", unread: true }; const { error: notificationError } = await client.from("notifications").upsert({ user_id: userId, client_key: notification.id, data: notification as unknown as Json }, { onConflict: "user_id,client_key" }); if (notificationError) throw notificationError; alertsCreated += 1; }
      await recordRun(client, userId, { startedAt, status: "Completed", searchesChecked: profiles.length, listingsAnalyzed, resultsFound: opportunities.length, alertsCreated });
    } catch (cause) { await recordRun(client, userId, { startedAt, status: "Failed", searchesChecked: profiles.length, resultsFound: 0, alertsCreated: 0, error: cause instanceof Error ? cause.message : "Recon sweep failed" }); }
  }
  return { usersScanned, listingsAnalyzed, targetsFound, alertsCreated };
}
function isHighValue(target: DealOpportunity) { const score = scoreDeal(target); return score.score >= 75 && (score.estimatedProfit ?? 0) > 0 && score.confidence === "High"; }
function notificationFor(target: DealOpportunity) { const score = scoreDeal(target); const profit = score.estimatedProfit === undefined ? "not entered" : `$${score.estimatedProfit.toFixed(0)}`; return { id: `recon-${target.id}`, title: `${target.detectedHardware?.model ?? target.title} found`, description: `Expected profit ${profit} · Opportunity score ${score.score} · ${target.marketplace}`, unread: true }; }
async function recordRun(client: SupabaseClient, userId: string, data: Record<string, unknown>) { await client.from("monitor_runs").insert({ user_id: userId, client_key: `run-${crypto.randomUUID()}`, data }); }
