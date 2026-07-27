import type { BuyVsPartOutAnalysis } from "@/types";

export function analyzeBuyVsPartOut(analysis: BuyVsPartOutAnalysis) {
  const acquisition = (analysis.askingPrice ?? 0) + (analysis.shipping ?? 0) + (analysis.tax ?? 0) + (analysis.buyerFees ?? 0) + (analysis.travelCost ?? 0);
  const wholeRevenue = analysis.wholeResaleValue ?? 0;
  const wholeFees = (analysis.sellingFees ?? 0) + (analysis.sellerShipping ?? 0);
  const wholeProfit = wholeRevenue - wholeFees - acquisition;
  const upgradeInvestment = acquisition + (analysis.repairCost ?? 0);
  const upgradeProfit = (analysis.upgradedResaleValue ?? 0) - wholeFees - upgradeInvestment;
  const partOut = analysis.components.reduce((total, component) => total + (component.expectedPartOutPrice ?? 0) - (component.marketplaceFees ?? 0) - (component.shippingCost ?? 0), 0);
  const partOutProfit = partOut - acquisition;
  const missing = [analysis.askingPrice, analysis.wholeResaleValue, analysis.components.length ? 1 : undefined].filter((item) => item === undefined).length;
  const risk = analysis.knownIssues || analysis.testStatus === "Untested" ? "High" : missing ? "Medium" : "Low";
  const recommendation = missing ? "Maybe" : partOutProfit > wholeProfit && partOutProfit > upgradeProfit ? "Buy and Part Out" : upgradeProfit > wholeProfit ? "Buy, Upgrade, and Resell" : wholeProfit > 0 ? "Buy and Resell Whole" : "Pass";
  return { acquisition, wholeProfit, wholeRoi: acquisition ? (wholeProfit / acquisition) * 100 : undefined, upgradeProfit, upgradeRoi: upgradeInvestment ? (upgradeProfit / upgradeInvestment) * 100 : undefined, partOutProceeds: partOut, partOutProfit, partOutRoi: acquisition ? (partOutProfit / acquisition) * 100 : undefined, risk, recommendation, confidence: missing ? "Low" : "Medium", missingInformation: missing ? "Add an asking price, a whole-system resale estimate, and part valuations before making a confident decision." : "No required fields are missing from this estimate." };
}
