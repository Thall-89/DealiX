import { describe, expect, it } from "vitest";
import { confirmedBuildFinancials, financialSummary, projectedBuildFinancials } from "../lib/financials";
import { partConfirmedProfit, partPayout, transactionFinancials } from "../lib/transactionFinancials";
import type { Build, InventoryItem, SourceTransaction } from "../types";

describe("build financials", () => {
  const soldBuild: Build = { id: "sold", slug: "sold", name: "Sold build", status: "Sold", buildCost: 500, salePrice: 750, mercariPayout: 690, profitBreakdown: { marketplaceFees: 40, shipping: 20, taxes: 5 } };

  it("uses the confirmed payout, rather than the advertised sale price, for profit", () => {
    expect(confirmedBuildFinancials(soldBuild)).toMatchObject({ soldPrice: 750, payout: 690, deductions: 65, totalInvested: 500, netProfit: 190, breakEvenSoldPrice: 565 });
  });

  it("keeps incomplete projections clearly marked", () => {
    expect(projectedBuildFinancials({ ...soldBuild, status: "Active", expectedSale: "$700–$800", partsNeeded: [{ name: "Fan", priority: "Low", status: "Needed", details: "" }] })).toEqual({ totalInvested: 500, lowProfit: 200, highProfit: 300, lowSale: 700, highSale: 800, incomplete: true });
  });

  it("separates confirmed money from projections in summaries", () => {
    const summary = financialSummary([soldBuild, { ...soldBuild, id: "open", status: "Listed", expectedSale: "$800-$900" }]);
    expect(summary).toMatchObject({ confirmedProfit: 190, confirmedPayouts: 690, moneyTiedUp: 500, projectedLow: 300, projectedHigh: 400 });
  });
});

describe("part-out financials", () => {
  const transaction: SourceTransaction = { id: "source-1", analysisId: "analysis", title: "Donor PC", marketplace: "Local", acquisitionCost: 200, purchaseDate: "2026-01-01", createdInventoryIds: ["gpu", "ram"] };
  const gpu: InventoryItem = { id: "gpu", slug: "gpu", name: "GPU", category: "GPU", brandModel: "GPU", purchaseCost: 120, allocatedCost: 120, condition: "Used", testingStatus: "Passed", currentStatus: "Sold", storageLocation: "Shelf", sourceTransactionId: "source-1", partSale: { marketplace: "eBay", acceptedSalePrice: 180, sellingFee: 18, shipping: 12, otherExpenses: 0, payoutConfirmed: true, status: "Sold" } };
  const ram: InventoryItem = { id: "ram", slug: "ram", name: "RAM", category: "RAM", brandModel: "RAM", purchaseCost: 80, allocatedCost: 80, estimatedResaleValue: 90, condition: "Used", testingStatus: "Passed", currentStatus: "Available", storageLocation: "Shelf", sourceTransactionId: "source-1" };

  it("calculates payout and only confirms profit after payout confirmation", () => {
    expect(partPayout(gpu)).toBe(150);
    expect(partConfirmedProfit(gpu)).toBe(30);
  });

  it("does not treat unsold value as recovered cash", () => {
    expect(transactionFinancials(transaction, [gpu, ram])).toMatchObject({ cashRecovered: 150, confirmedProfit: -50, remainingUnrecovered: 50, unsoldEstimatedValue: 90, projectedFinalProfit: 40, soldCount: 1, unsoldCount: 1 });
  });
});
