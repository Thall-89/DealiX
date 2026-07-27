import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dealFromNormalizedListing } from "@/lib/dealDiscovery";
import { applySearchTargets, matchSavedSearch, qualifiesForAlert } from "@/lib/dealMatching";
import { scoreDeal } from "@/lib/dealScoring";
import type { NormalizedListing } from "@/lib/marketplaces";
import type { DealOpportunity, SavedDealSearch } from "@/types";
import type { Json } from "@/types/database";

export async function processReconListings(client: SupabaseClient, userId: string, profiles: SavedDealSearch[], listings: NormalizedListing[]) {
  const { data: stored, error: readError } = await client.from("marketplace_results").select("client_key,data").eq("user_id", userId).limit(5_000);
  if (readError) throw readError;
  const existing = new Map((stored ?? []).flatMap((row) => row.client_key && row.data ? [[row.client_key, row.data as DealOpportunity] as const] : []));
  const targets = new Map<string, DealOpportunity>(); let filtered = 0;
  for (const listing of listings) for (const profile of profiles) {
    const candidate = applySearchTargets(dealFromNormalizedListing(listing), profile);
    if (!matchSavedSearch(candidate, profile).included || !qualifiesForAlert(candidate, profile).passed) { filtered += 1; continue; }
    const prior = existing.get(candidate.id);
    targets.set(candidate.id, prior ? withMarketMemory(candidate, prior) : withMarketMemory(candidate));
  }
  const saved = [...targets.values()]; const newTargets = saved.filter((target) => !existing.has(target.id) && highValue(target));
  if (saved.length) { const { error } = await client.from("marketplace_results").upsert(saved.map((target) => ({ user_id: userId, client_key: target.id, data: target as unknown as Json })), { onConflict: "user_id,client_key" }); if (error) throw error; }
  const observations = saved.filter((target) => target.askingPrice !== undefined && target.providerId && target.externalListingId).map((target) => ({ user_id: userId, provider_id: target.providerId, external_listing_id: target.externalListingId, observed_price: target.askingPrice, shipping: target.shipping, seller_name: target.sellerName }));
  if (observations.length) await client.from("recon_price_observations").insert(observations);
  let notificationsCreated = 0;
  if (newTargets.length && profiles.some((profile) => profile.notificationEnabled)) { const first = newTargets[0]; const score = scoreDeal(first); const notification = newTargets.length === 1 ? { id: `recon-${first.id}`, title: `Target acquired: ${first.detectedHardware?.model ?? first.title}`, description: `Expected profit ${score.estimatedProfit === undefined ? "not entered" : `$${score.estimatedProfit.toFixed(0)}`} · Score ${score.score} · ${first.marketplace}`, unread: true } : { id: `recon-${Date.now()}`, title: `${newTargets.length} new targets acquired`, description: "New high-confidence Recon opportunities are ready for review.", unread: true }; const { error } = await client.from("notifications").upsert({ user_id: userId, client_key: notification.id, data: notification as unknown as Json }, { onConflict: "user_id,client_key" }); if (error) throw error; notificationsCreated = 1; }
  return { listingsAnalyzed: listings.length, targetsSaved: saved.length, targetsFiltered: filtered, newTargets: newTargets.length, notificationsCreated };
}
function highValue(target: DealOpportunity) { const score = scoreDeal(target); return score.score >= 75 && (score.estimatedProfit ?? 0) > 0 && score.confidence === "High"; }
function withMarketMemory(target: DealOpportunity, previous?: DealOpportunity): DealOpportunity { const price = target.askingPrice; if (price === undefined) return { ...target, firstSeen: previous?.firstSeen ?? target.dateFound, timesSeen: (previous?.timesSeen ?? 0) + 1 }; const timesSeen = (previous?.timesSeen ?? 0) + 1; const averageObservedPrice = previous?.averageObservedPrice === undefined ? price : Number(((previous.averageObservedPrice * (timesSeen - 1) + price) / timesSeen).toFixed(2)); return { ...target, saved: previous?.saved, dismissed: previous?.dismissed, compatibleBuildIds: previous?.compatibleBuildIds, offer: previous?.offer, dateFound: previous?.dateFound ?? target.dateFound, firstSeen: previous?.firstSeen ?? target.dateFound, lastChecked: new Date().toISOString(), lowestObservedPrice: Math.min(previous?.lowestObservedPrice ?? price, price), highestObservedPrice: Math.max(previous?.highestObservedPrice ?? price, price), averageObservedPrice, timesSeen }; }
