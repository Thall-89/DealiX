import { describe, expect, it } from "vitest";
import { analyzeBuildHealth } from "../lib/buildHealth";
import { scoreDeal } from "../lib/dealScoring";
import type { Build, DealOpportunity, TestingResult } from "../types";

describe("build health", () => {
  const readyBuild: Build = { id: "build-1", slug: "build-1", name: "Ready build", status: "Active", buildCost: 400, cpu: "CPU", gpu: "GPU", motherboard: "Board", ram: "16 GB", storage: "1 TB", psu: "650 W", case: "Case" };
  const completedTesting: TestingResult = { buildId: "build-1", checklist: [{ id: "boot", label: "Boot", done: true }], notes: "", cpuTemp: "", gpuTemp: "", benchmark: "", failedPart: "" };

  it("blocks a build when a high-priority missing part exists", () => {
    const result = analyzeBuildHealth({ ...readyBuild, partsNeeded: [{ name: "Compatible motherboard", priority: "High", status: "Needed", details: "" }] }, [], completedTesting);
    expect(result).toMatchObject({ state: "Blocked", headline: "A critical item is blocking progress", nextStep: "Source Compatible motherboard before moving this build forward." });
  });

  it("marks a complete, tested build as ready", () => {
    expect(analyzeBuildHealth(readyBuild, [], completedTesting)).toMatchObject({ score: 100, state: "Ready" });
  });
});

describe("deal scoring", () => {
  const deal: DealOpportunity = { id: "deal-1", title: "RTX deal", marketplace: "eBay", listingType: "Listing", category: "GPU", sourceType: "Manual", askingPrice: 200, shipping: 10, estimatedTax: 0, buyerFees: 0, estimatedResaleValue: 350, estimatedSellingFees: 35, estimatedSellerShipping: 15, targetPrice: 250, compatibility: "Compatible", sellerRating: 4.9, returnPolicy: "Returns accepted", testingStatus: "Passed", dateFound: "2026-01-01", lastChecked: "2026-01-01" };

  it("explains a profitable compatible deal without inventing values", () => {
    const result = scoreDeal(deal);
    expect(result).toMatchObject({ landedCost: 210, estimatedProfit: 90, breakEvenPrice: 300, maximumRecommendedPrice: 250, compatibility: "Compatible", urgency: "Review Now" });
    expect(result.reasons).toContain("Compatible with the selected build");
  });

  it("flags missing pricing and compatibility risks", () => {
    const result = scoreDeal({ ...deal, askingPrice: undefined, estimatedResaleValue: undefined, compatibility: "Not Compatible", sellerRating: undefined, returnPolicy: undefined, testingStatus: "Untested" });
    expect(result.risks).toEqual(expect.arrayContaining(["Target price not configured", "Resale or cost information is incomplete", "Not compatible with the selected build", "Seller rating not entered", "No testing evidence"]));
  });
});
