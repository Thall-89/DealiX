import type { Build } from "@/types";

const money = (value?: number) => value ?? 0;

export function confirmedBuildFinancials(build: Build) {
  const soldPrice = money(build.profitBreakdown?.salePrice ?? build.salePrice);
  const payout = money(build.profitBreakdown?.payout ?? build.mercariPayout);
  const marketplaceFees = money(build.profitBreakdown?.marketplaceFees);
  const shippingPaid = money(build.profitBreakdown?.shipping);
  const totalInvested = money(build.profitBreakdown?.buildCost ?? build.buildCost);
  const deductions = marketplaceFees + shippingPaid + money(build.profitBreakdown?.taxes);
  const netProfit = payout - totalInvested;
  return { soldPrice, payout, marketplaceFees, shippingPaid, deductions, totalInvested, netProfit, roi: totalInvested ? (netProfit / totalInvested) * 100 : undefined, margin: soldPrice ? (netProfit / soldPrice) * 100 : undefined, breakEvenSoldPrice: totalInvested + deductions };
}

export function parseMoneyRange(value?: string) {
  const values = (value ?? "").match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return values.length >= 2 ? { low: values[0], high: values[1] } : undefined;
}

export function projectedBuildFinancials(build: Build) {
  const range = parseMoneyRange(build.expectedSale ?? build.estimatedResale);
  if (!range) return undefined;
  const totalInvested = build.buildCost;
  const missingCosts = Boolean(build.partsNeeded?.length) || build.profitBreakdown?.marketplaceFees === undefined || build.profitBreakdown?.shipping === undefined;
  return { totalInvested, lowProfit: range.low - totalInvested, highProfit: range.high - totalInvested, lowSale: range.low, highSale: range.high, incomplete: missingCosts };
}

export function financialSummary(builds: Build[]) {
  const sold = builds.filter((build) => build.status === "Sold");
  const open = builds.filter((build) => build.status !== "Sold");
  const completed = sold.map(confirmedBuildFinancials);
  const projections = open.map(projectedBuildFinancials).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return { confirmedProfit: completed.reduce((sum, item) => sum + item.netProfit, 0), confirmedPayouts: completed.reduce((sum, item) => sum + item.payout, 0), marketplaceFees: completed.reduce((sum, item) => sum + item.marketplaceFees, 0), shippingPaid: completed.reduce((sum, item) => sum + item.shippingPaid, 0), cashRecovered: completed.reduce((sum, item) => sum + item.payout, 0), moneyTiedUp: open.reduce((sum, build) => sum + build.buildCost, 0), recordedSpending: builds.reduce((sum, build) => sum + build.buildCost, 0), projectedLow: projections.reduce((sum, item) => sum + item.lowProfit, 0), projectedHigh: projections.reduce((sum, item) => sum + item.highProfit, 0), hasIncompleteProjection: projections.some((item) => item.incomplete) };
}
