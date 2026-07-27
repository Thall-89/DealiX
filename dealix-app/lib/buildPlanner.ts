import type { DealOpportunity, InventoryItem } from "@/types";

export type PlannedPart = { category: string; name: string; source: "Target" | "Inventory" | "Needs source"; cost?: number; note: string };
export type BuildPlan = { style: "Budget" | "Balanced" | "Fast flip"; parts: PlannedPart[]; knownCost: number; unknownCostCount: number; compatibility: "Ready to verify" | "Blocked"; reasons: string[] };

const required = ["CPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "CPU Cooler"];
function categoryFor(target: DealOpportunity) { return target.category === "Complete PC" ? "Complete PC" : target.category === "GPU" ? "GPU" : target.category === "CPU" ? "CPU" : target.category; }
function available(inventory: InventoryItem[], category: string) { return inventory.find((item) => item.availability === "Available" && item.currentStatus === "Available" && `${item.category} ${item.name}`.toLowerCase().includes(category.toLowerCase())); }
export function createBuildPlans(target: DealOpportunity, inventory: InventoryItem[]): BuildPlan[] {
  const targetCategory = categoryFor(target); const targetCost = target.askingPrice === undefined ? undefined : target.askingPrice + (target.shipping ?? 0) + (target.estimatedTax ?? 0);
  if (targetCategory === "Complete PC") return ["Budget", "Balanced", "Fast flip"].map((style) => ({ style: style as BuildPlan["style"], parts: [{ category: "Complete PC", name: target.title, source: "Target", cost: targetCost, note: "Treat as a complete-system acquisition; inspect before changing components." }], knownCost: targetCost ?? 0, unknownCostCount: targetCost === undefined ? 1 : 0, compatibility: "Ready to verify", reasons: ["The target is already a complete PC.", "No resale estimate is shown until comparable sale data is recorded."] }));
  return ["Budget", "Balanced", "Fast flip"].map((style) => {
    const parts: PlannedPart[] = [{ category: targetCategory, name: target.title, source: "Target", cost: targetCost, note: "Starting component from Recon." }];
    for (const category of required) { if (category === targetCategory) continue; const item = available(inventory, category === "RAM" ? "Memory" : category); parts.push(item ? { category, name: item.name, source: "Inventory", cost: item.purchaseCost, note: "Available inventory is used before recommending a purchase." } : { category, name: `Compatible ${category}`, source: "Needs source", note: style === "Fast flip" ? "Source a tested, common-market option." : "Price and compatibility must be confirmed." }); }
    const knownCost = parts.reduce((total, part) => total + (part.cost ?? 0), 0); const unknownCostCount = parts.filter((part) => part.cost === undefined).length;
    return { style: style as BuildPlan["style"], parts, knownCost, unknownCostCount, compatibility: targetCategory === "GPU" || targetCategory === "CPU" ? "Ready to verify" : "Blocked", reasons: ["Uses available inventory first.", unknownCostCount ? `${unknownCostCount} required part${unknownCostCount === 1 ? " needs" : "s need"} a recorded source price.` : "All component costs are recorded.", "Socket, RAM generation, power, and fit must be verified before reserving parts."] };
  });
}
