import type { InventoryItem, SourceTransaction } from "@/types";

export function partPayout(item: InventoryItem) {
  const sale = item.partSale;
  if (!sale) return undefined;
  if (sale.payout !== undefined) return sale.payout;
  if (sale.acceptedSalePrice === undefined) return undefined;
  return sale.acceptedSalePrice - (sale.sellingFee ?? 0) - (sale.shipping ?? 0) - (sale.otherExpenses ?? 0);
}

export function partConfirmedProfit(item: InventoryItem) {
  const payout = partPayout(item);
  if (!item.partSale?.payoutConfirmed || payout === undefined) return undefined;
  return payout - (item.allocatedCost ?? item.purchaseCost) - (item.partSale.refundAmount ?? 0);
}

export function transactionFinancials(transaction: SourceTransaction, items: InventoryItem[]) {
  const parts = items.filter((item) => item.sourceTransactionId === transaction.id);
  const allocatedCost = parts.reduce((sum, item) => sum + (item.allocatedCost ?? 0), 0);
  const recovered = parts.reduce((sum, item) => sum + (item.partSale?.payoutConfirmed ? (partPayout(item) ?? 0) - (item.partSale.refundAmount ?? 0) : 0), 0);
  const confirmedProfit = recovered - transaction.acquisitionCost;
  const unsold = parts.filter((item) => !item.partSale?.payoutConfirmed && item.currentStatus !== "Sold");
  const projectedRemaining = unsold.reduce((sum, item) => sum + (item.estimatedResaleValue ?? 0), 0);
  return { parts, allocatedCost, cashRecovered: recovered, confirmedProfit, remainingUnrecovered: Math.max(0, transaction.acquisitionCost - recovered), unsoldEstimatedValue: projectedRemaining, projectedFinalProfit: recovered + projectedRemaining - transaction.acquisitionCost, soldCount: parts.filter((item) => item.partSale?.payoutConfirmed).length, unsoldCount: unsold.length };
}
