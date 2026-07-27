import type { DealCompatibilityLabel, DealConfidenceLabel, DealOpportunity, DealRiskLabel, DealScoreLabel, DealUrgencyLabel } from "@/types";

export interface DealScoreResult {
  score: number; value: DealScoreLabel; risk: DealRiskLabel; compatibility: DealCompatibilityLabel; confidence: DealConfidenceLabel; urgency: DealUrgencyLabel;
  landedCost?: number; estimatedProfit?: number; estimatedRoi?: number; priceDifference?: number; priceDifferencePercent?: number; breakEvenPrice?: number; maximumRecommendedPrice?: number;
  reasons: string[]; risks: string[];
}

const money = (value?: number) => value === undefined ? undefined : Number(value.toFixed(2));

export function scoreDeal(deal: DealOpportunity): DealScoreResult {
  const landedCost = deal.askingPrice === undefined ? undefined : deal.askingPrice + (deal.shipping ?? 0) + (deal.estimatedTax ?? 0) + (deal.buyerFees ?? 0) + (deal.travelCost ?? 0);
  const proceeds = deal.estimatedResaleValue === undefined ? undefined : deal.estimatedResaleValue - (deal.estimatedSellingFees ?? 0) - (deal.estimatedSellerShipping ?? 0) - (deal.estimatedRepairCost ?? 0);
  const profit = landedCost === undefined || proceeds === undefined ? undefined : proceeds - landedCost;
  const roi = profit === undefined || !landedCost ? undefined : profit / landedCost * 100;
  const priceDifference = deal.targetPrice === undefined || landedCost === undefined ? undefined : deal.targetPrice - landedCost;
  const priceDifferencePercent = priceDifference === undefined || !deal.targetPrice ? undefined : priceDifference / deal.targetPrice * 100;
  const breakEvenPrice = proceeds;
  const maximumRecommendedPrice = deal.targetPrice ?? (proceeds === undefined ? undefined : proceeds);
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 35;
  if (priceDifferencePercent !== undefined) { score += Math.max(-20, Math.min(28, priceDifferencePercent)); reasons.push(`${Math.abs(priceDifferencePercent).toFixed(0)}% ${priceDifferencePercent >= 0 ? "below" : "above"} target`); }
  else risks.push("Target price not configured");
  if (profit !== undefined) { score += profit > 0 ? 12 : -14; reasons.push(`Estimated ${profit >= 0 ? "profit" : "loss"}: $${profit.toFixed(2)}`); }
  else risks.push("Resale or cost information is incomplete");
  if (roi !== undefined && roi >= 20) { score += 8; reasons.push("Estimated ROI is above 20%"); }
  if (deal.compatibility === "Compatible") { score += 14; reasons.push(deal.missingPartCompleted ? `Completes ${deal.missingPartCompleted}` : "Compatible with the selected build"); }
  if (deal.compatibility === "Compatible with Warning") { score += 5; risks.push("Compatibility has a warning"); }
  if (deal.compatibility === "Not Compatible") { score -= 22; risks.push("Not compatible with the selected build"); }
  if (deal.sellerRating !== undefined) { score += deal.sellerRating >= 4.7 ? 7 : deal.sellerRating < 4 ? -7 : 1; if (deal.sellerRating < 4) risks.push("Seller rating is below 4.0"); }
  else risks.push("Seller rating not entered");
  if (deal.returnPolicy?.toLowerCase().includes("accept")) { score += 5; reasons.push("Returns accepted"); } else if (deal.returnPolicy) risks.push("Returns are not accepted");
  if (deal.testingStatus?.toLowerCase().includes("pass")) { score += 5; reasons.push("Testing evidence recorded"); } else if (deal.testingStatus?.toLowerCase().includes("untest")) risks.push("No testing evidence");
  if ((deal.shipping ?? 0) > 25) risks.push("Shipping meaningfully reduces margin");
  if ((deal.estimatedRepairCost ?? 0) > 0) risks.push("Repair cost is estimated");
  const knownFields = [deal.askingPrice, deal.estimatedResaleValue, deal.sellerRating, deal.returnPolicy, deal.condition, deal.listingUrl].filter((value) => value !== undefined && value !== "").length;
  const confidence: DealConfidenceLabel = knownFields >= 5 ? "High" : knownFields >= 3 ? "Medium" : knownFields ? "Low" : "Insufficient Data";
  if (confidence === "Low" || confidence === "Insufficient Data") risks.push("Listing information is incomplete");
  score = Math.round(Math.max(0, Math.min(100, score)));
  const risk: DealRiskLabel = score >= 75 && risks.length <= 2 ? "Low" : score >= 50 ? "Medium" : score >= 25 ? "High" : "Critical";
  return { score, value: score >= 75 ? "Excellent" : score >= 55 ? "Good" : score >= 35 ? "Fair" : "Poor", risk, compatibility: deal.compatibility, confidence, urgency: score >= 75 ? "Review Now" : score >= 55 ? "Review Soon" : score >= 35 ? "Watch" : "Low Priority", landedCost: money(landedCost), estimatedProfit: money(profit), estimatedRoi: money(roi), priceDifference: money(priceDifference), priceDifferencePercent: money(priceDifferencePercent), breakEvenPrice: money(breakEvenPrice), maximumRecommendedPrice: money(maximumRecommendedPrice), reasons, risks };
}
