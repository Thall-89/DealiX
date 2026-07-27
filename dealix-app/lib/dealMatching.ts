import { detectGpuFromTitle } from "@/lib/gpuMetadata";
import { scoreDeal } from "@/lib/dealScoring";
import type { DealConfidenceLabel, DealOpportunity, SavedDealSearch } from "@/types";

const confidenceRank: Record<DealConfidenceLabel, number> = { "Insufficient Data": 0, Low: 1, Medium: 2, High: 3 };
const accessoryTerms = /\b(enclosure|egpu|water\s*block|heatsink|cooler|fan|empty\s*box|box\s*only|backplate|shroud|mining\s*frame)\b/i;
const laptopTerms = /\b(laptop|mobile|notebook|mxm|gaming\s*laptop|laptop\s*gpu|replacement\s*laptop\s*motherboard)\b/i;
const forPartsTerms = /\b(for\s*parts|not\s*working|broken|repair)\b/i;
const normalizedUrl = (url?: string) => url?.toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "") ?? "";

export function dealFingerprint(deal: DealOpportunity) { return normalizedUrl(deal.listingUrl) || `${deal.marketplace.toLowerCase()}|${(deal.sellerName ?? "").toLowerCase()}|${deal.title.toLowerCase().replace(/[^a-z0-9]/g, "")}`; }

export function enrichDealDetection(deal: DealOpportunity): DealOpportunity {
  if (deal.category !== "GPU") return deal;
  const detected = detectGpuFromTitle(deal.title);
  return { ...deal, detectedHardware: detected };
}

export function matchSavedSearch(deal: DealOpportunity, search: SavedDealSearch) {
  const enriched = enrichDealDetection(deal); const detected = enriched.detectedHardware;
  const rules: boolean[] = [];
  if (search.category) rules.push(deal.category === search.category || (search.category === "CPU Bundle" && deal.category === "Complete PC"));
  if (search.gpuManufacturer) rules.push(detected?.manufacturer === search.gpuManufacturer);
  if (search.gpuGeneration) rules.push(detected?.series === search.gpuGeneration);
  if (search.exactModelIncludes?.length) rules.push(Boolean(detected?.model && search.exactModelIncludes.includes(detected.model)));
  if (search.exactModelExcludes?.length && detected?.model) rules.push(!search.exactModelExcludes.includes(detected.model));
  if (search.category === "GPU" && search.excludeLaptopGpu !== false) rules.push(!laptopTerms.test(deal.title));
  if (search.category === "GPU" && search.excludeAccessories !== false) rules.push(!accessoryTerms.test(deal.title));
  if (!search.allowForParts) rules.push(!forPartsTerms.test(deal.title));
  const included = rules.every(Boolean);
  const exclusion = laptopTerms.test(deal.title) ? "Likely laptop/mobile GPU" : accessoryTerms.test(deal.title) ? "Accessory or enclosure, not a usable GPU" : forPartsTerms.test(deal.title) ? "For-parts/broken listing excluded" : undefined;
  return { deal: enriched, included, exclusion };
}

export function applySearchTargets(deal: DealOpportunity, search: SavedDealSearch): DealOpportunity {
  const detected = deal.detectedHardware; const exact = search.exactModelIncludes?.includes(detected?.model ?? "") ? search.targetPrice : undefined;
  const targetPrice = exact ?? search.targetPrice ?? search.seriesTargetPrice;
  return { ...deal, targetPrice, targetSource: exact !== undefined ? "Exact model" : search.targetPrice !== undefined ? "Saved search" : search.seriesTargetPrice !== undefined ? "Series" : undefined };
}

export function qualifiesForAlert(deal: DealOpportunity, search: SavedDealSearch) {
  const score = scoreDeal(deal); const checks: Array<{ enabled: boolean; pass: boolean; label: string }> = [
    { enabled: search.maximumLandedCost !== undefined, pass: score.landedCost !== undefined && score.landedCost <= (search.maximumLandedCost ?? Infinity), label: "landed cost meets the configured maximum" },
    { enabled: search.minimumExpectedProfit !== undefined, pass: score.estimatedProfit !== undefined && score.estimatedProfit >= (search.minimumExpectedProfit ?? 0), label: "estimated profit meets the target" },
    { enabled: search.minimumRoi !== undefined, pass: score.estimatedRoi !== undefined && score.estimatedRoi >= (search.minimumRoi ?? 0), label: "estimated ROI meets the target" },
    { enabled: search.minimumOpportunityScore !== undefined, pass: score.score >= (search.minimumOpportunityScore ?? 0), label: "opportunity score meets the target" },
    { enabled: search.minimumSellerRating !== undefined, pass: deal.sellerRating !== undefined && deal.sellerRating >= (search.minimumSellerRating ?? 0), label: "seller rating meets the minimum" },
    { enabled: search.returnsRequired, pass: Boolean(deal.returnPolicy?.toLowerCase().includes("accept")), label: "returns are accepted" },
    { enabled: Boolean(search.compatibleBuildId), pass: deal.compatibleBuildIds?.includes(search.compatibleBuildId ?? "") ?? false, label: "compatible with the selected build" },
    { enabled: Boolean(search.minimumConfidence), pass: confidenceRank[deal.detectedHardware?.confidence ?? "Insufficient Data"] >= confidenceRank[search.minimumConfidence ?? "Insufficient Data"], label: "detection confidence meets the minimum" },
  ];
  const active = checks.filter((check) => check.enabled); const passes = active.filter((check) => check.pass); const passed = !active.length ? true : search.requireAllRules === false ? passes.length > 0 : passes.length === active.length;
  return { passed, score, reasons: passes.map((check) => check.label), failed: active.filter((check) => !check.pass).map((check) => check.label) };
}
