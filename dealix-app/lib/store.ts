"use client";

import { useSyncExternalStore } from "react";
import { dealFingerprint, applySearchTargets, matchSavedSearch, qualifiesForAlert } from "@/lib/dealMatching";
import { scoreDeal } from "@/lib/dealScoring";
import {
  settingsDefaults,
  testingChecklist,
} from "@/lib/mockData";
import { activeRepository } from "@/lib/data/repository";
import { supabase, supabaseConfigured } from "@/lib/supabase/client";
import type {
  Build,
  InventoryItem,
  NotificationItem,
  Settings,
  TaskItem,
  TestingResult,
  BuyVsPartOutAnalysis,
  SourceTransaction,
  AuditEvent,
  MarketplaceListing,
  BuildTemplate,
  DealAlert,
  DealOpportunity,
  SavedDealSearch,
  WatchlistItem,
} from "@/types";
import type { MarketIntelligenceSnapshot } from "@/lib/marketIntelligence/types";

const STORAGE_KEY_PREFIX = "dealix_data_v1";

export interface DealiXData {
  builds: Build[];
  inventory: InventoryItem[];
  tasks: TaskItem[];
  notifications: NotificationItem[];
  settings: Settings;
  testingResults: Record<string, TestingResult>;
  analyses: BuyVsPartOutAnalysis[];
  sourceTransactions: SourceTransaction[];
  auditEvents: AuditEvent[];
  listings: MarketplaceListing[];
  templates: BuildTemplate[];
  dealOpportunities: DealOpportunity[];
  savedDealSearches: SavedDealSearch[];
  watchlist: WatchlistItem[];
  dealAlerts: DealAlert[];
}

function createEmptyData(): DealiXData {
  return {
    builds: [],
    inventory: [],
    tasks: [],
    notifications: [],
    settings: { ...structuredClone(settingsDefaults), profileName: "" },
    testingResults: {},
    analyses: [],
    sourceTransactions: [],
    auditEvents: [],
    listings: [],
    templates: [],
    dealOpportunities: [],
    savedDealSearches: [],
    watchlist: [],
    dealAlerts: [],
  };
}

const serverSnapshot = createEmptyData();
let data = serverSnapshot;
let loaded = false;
const listeners = new Set<() => void>();
let activeUserId: string | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
let persistTimer: ReturnType<typeof setTimeout> | undefined;
let hydratingUserId: string | null = null;

function storageKey(userId: string | null) {
  return `${STORAGE_KEY_PREFIX}:${userId ?? "anonymous"}`;
}

function normalizeSnapshot(snapshot: Partial<DealiXData> | null | undefined): DealiXData {
  const empty = createEmptyData();
  if (!snapshot) return empty;
  return {
    ...empty,
    ...snapshot,
    settings: { ...empty.settings, ...(snapshot.settings ?? {}) },
    testingResults: snapshot.testingResults ?? {},
    analyses: snapshot.analyses ?? [],
    sourceTransactions: snapshot.sourceTransactions ?? [],
    auditEvents: snapshot.auditEvents ?? [],
    listings: snapshot.listings ?? [],
    templates: snapshot.templates ?? [],
    dealOpportunities: snapshot.dealOpportunities ?? [],
    savedDealSearches: snapshot.savedDealSearches ?? [],
    watchlist: snapshot.watchlist ?? [],
    dealAlerts: snapshot.dealAlerts ?? [],
    builds: snapshot.builds ?? [],
    inventory: snapshot.inventory ?? [],
    tasks: snapshot.tasks ?? [],
    notifications: snapshot.notifications ?? [],
  };
}

function readLocalSnapshot(userId: string | null) {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(storageKey(userId));
  if (!stored) return null;
  return normalizeSnapshot(JSON.parse(stored) as Partial<DealiXData>);
}

function persistLocalSnapshot() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(activeUserId), JSON.stringify(data));
}

function queueCloudSave() {
  if (!supabaseConfigured || !activeUserId || hydratingUserId) return;
  if (persistTimer) clearTimeout(persistTimer);
  const ownerId = activeUserId;
  const snapshot = data;
  persistTimer = setTimeout(async () => {
    if (activeUserId !== ownerId || hydratingUserId) return;
    try {
      await activeRepository().save(snapshot, ownerId);
    } catch (error) {
      console.error("Failed to save DealiX workspace to cloud storage.", error);
    }
  }, 600);
}

function emit(syncCloud = true) {
  persistLocalSnapshot();
  if (syncCloud) queueCloudSave();
  listeners.forEach((listener) => listener());
}

function setData(next: DealiXData, syncCloud = true) {
  data = next;
  emit(syncCloud);
}

async function hydrateUserWorkspace(userId: string) {
  hydratingUserId = userId;
  try {
    const cloudSnapshot = await activeRepository().load();
    if (activeUserId !== userId) return;
    if (cloudSnapshot) {
      setData(normalizeSnapshot(cloudSnapshot), false);
      return;
    }
    const localSnapshot = readLocalSnapshot(userId);
    setData(localSnapshot ?? createEmptyData(), false);
  } catch (error) {
    if (activeUserId !== userId) return;
    console.error("Failed to load DealiX workspace from cloud storage.", error);
    const localSnapshot = readLocalSnapshot(userId);
    setData(localSnapshot ?? createEmptyData(), false);
  } finally {
    if (hydratingUserId === userId) hydratingUserId = null;
  }
}

function bindAuthSession() {
  if (!supabaseConfigured || !supabase || authSubscription) return;

  const handleUser = async (userId: string | null) => {
    if (userId === activeUserId) return;
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = undefined; }
    activeUserId = userId;
    if (!userId) {
      setData(createEmptyData(), false);
      return;
    }
    // Never render or persist the previous account's workspace while the new
    // account is being hydrated. This also prevents a rapid account switch
    // from writing stale data into the next user's cloud snapshot.
    setData(createEmptyData(), false);
    await hydrateUserWorkspace(userId);
  };

  void supabase.auth.getUser().then(({ data: auth }) => handleUser(auth.user?.id ?? null)).catch((error) => {
    console.error("Failed to resolve authenticated user for DealiX workspace.", error);
    void handleUser(null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    void handleUser(session?.user?.id ?? null);
  });
  authSubscription = listener.subscription;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  if (supabaseConfigured) {
    bindAuthSession();
    return;
  }
  try {
    data = readLocalSnapshot(null) ?? createEmptyData();
  } catch (error) {
    console.error("Failed to load local DealiX workspace.", error);
    data = createEmptyData();
  }
  emit(false);
}

export const dealixStore = {
  getSnapshot() {
    load();
    return data;
  },
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hydrateMarketIntelligence(snapshot: MarketIntelligenceSnapshot) {
    setData({
      ...data,
      savedDealSearches: snapshot.savedDealSearches,
      dealOpportunities: snapshot.dealOpportunities,
      watchlist: snapshot.watchlist,
      dealAlerts: snapshot.dealAlerts,
      notifications: snapshot.notifications,
      settings: { ...data.settings, ...snapshot.preferences },
    });
  },
  updateBuild(build: Build) {
    const previous = data.builds.find((item) => item.id === build.id);
    const missingPartNames = new Set((build.partsNeeded ?? []).map((part) => part.name.toLowerCase()));
    const reconciledTasks: TaskItem[] = data.tasks.map((task) => {
      if (task.buildId !== build.id || !task.title.startsWith("Find missing part:")) return task;
      const partName = task.title.replace("Find missing part:", "").trim().toLowerCase();
      return missingPartNames.has(partName) ? task : { ...task, completed: true, status: "Completed" as const };
    });
    const newTasks = (build.partsNeeded ?? []).filter((part) => !reconciledTasks.some((task) => task.buildId === build.id && task.title.toLowerCase() === `find missing part: ${part.name}`.toLowerCase())).map((part) => ({
      id: `task-missing-${crypto.randomUUID()}`,
      title: `Find missing part: ${part.name}`,
      buildId: build.id,
      relatedBuild: build.name,
      priority: part.priority,
      status: "Blocked" as const,
      completed: false,
      notes: part.details,
    }));
    const status = previous?.partsNeeded?.length && !build.partsNeeded?.length && build.status === "Active" ? "Active" : build.status;
    setData({ ...data, builds: data.builds.map((item) => (item.id === build.id ? { ...build, status } : item)), tasks: [...reconciledTasks, ...newTasks] });
  },
  addBuild(build: Build) {
    data = { ...data, builds: [...data.builds, build] };
    this.updateBuild(build);
  },
  deleteBuild(id: string) {
    setData({ ...data, builds: data.builds.filter((build) => build.id !== id), tasks: data.tasks.filter((task) => task.buildId !== id) });
  },
  updateInventory(item: InventoryItem) {
    setData({ ...data, inventory: data.inventory.map((entry) => (entry.id === item.id ? item : entry)) });
  },
  addInventory(item: InventoryItem) {
    setData({ ...data, inventory: [...data.inventory, item] });
  },
  deleteInventory(id: string) {
    setData({ ...data, inventory: data.inventory.filter((item) => item.id !== id) });
  },
  updateTask(task: TaskItem) {
    setData({ ...data, tasks: data.tasks.map((item) => (item.id === task.id ? task : item)) });
  },
  dismissNotification(id: string) {
    setData({ ...data, notifications: data.notifications.map((item) => (item.id === id ? { ...item, dismissed: true, unread: false } : item)) });
  },
  updateSettings(settings: Settings) {
    setData({ ...data, settings });
  },
  updateTestingResult(result: TestingResult) {
    const build = data.builds.find((item) => item.id === result.buildId);
    const hasFailure = Boolean(result.failedPart);
    const repairTitle = `Repair or replace failed part: ${result.failedPart}`;
    const repairTaskExists = data.tasks.some((task) => task.buildId === result.buildId && task.title === repairTitle && !task.completed);
    const nextTasks = hasFailure && result.createRepairTask === false ? data.tasks.filter((task) => task.title !== repairTitle || task.buildId !== result.buildId) : hasFailure && !repairTaskExists ? [...data.tasks, { id: `task-repair-${crypto.randomUUID()}`, title: repairTitle, buildId: result.buildId, relatedBuild: build?.name, priority: "High" as const, status: "Open" as const, completed: false, notes: "Created from the testing workflow." }] : data.tasks;
    const nextNotifications = hasFailure ? [...data.notifications.filter((item) => item.id !== `testing-failure-${result.buildId}`), { id: `testing-failure-${result.buildId}`, title: `${build?.name ?? "Build"} has a failed test`, description: `${result.failedPart} needs attention before the build is ready.`, unread: true }] : data.notifications;
    setData({ ...data, tasks: nextTasks, notifications: nextNotifications, testingResults: { ...data.testingResults, [result.buildId]: result } });
  },
  assignMockMotherboard(buildId: string, motherboard: string, explanation: string) {
    const build = data.builds.find((item) => item.id === buildId);
    if (!build) return;
    this.updateBuild({ ...build, motherboard, partsNeeded: (build.partsNeeded ?? []).filter((part) => part.name.toLowerCase() !== "compatible motherboard"), notes: `${build.notes ?? ""}\nMock compatibility candidate selected: ${motherboard}. ${explanation}`.trim(), health: "Needs attention" });
  },
  saveAnalysis(analysis: BuyVsPartOutAnalysis) {
    setData({ ...data, analyses: [...data.analyses.filter((item) => item.id !== analysis.id), analysis] });
  },
  startPartOut(analysisId: string, allocation: "Equal split" | "Proportional by estimated resale value") {
    const analysis = data.analyses.find((item) => item.id === analysisId);
    if (!analysis || analysis.status && analysis.status !== "Analysis Only") return { ok: false, message: "This analysis has already been converted." };
    const acquisitionCost = (analysis.askingPrice ?? 0) + (analysis.shipping ?? 0) + (analysis.tax ?? 0) + (analysis.buyerFees ?? 0) + (analysis.travelCost ?? 0);
    if (!analysis.components.length || acquisitionCost <= 0) return { ok: false, message: "Add an acquisition cost and at least one component before starting a part out." };
    const transactionId = `source-${crypto.randomUUID()}`;
    const totalValue = analysis.components.reduce((sum, component) => sum + (component.expectedPartOutPrice ?? 0), 0);
    let assigned = 0;
    const parts = analysis.components.map((component, index) => {
      const raw = allocation === "Proportional by estimated resale value" && totalValue > 0 ? acquisitionCost * ((component.expectedPartOutPrice ?? 0) / totalValue) : acquisitionCost / analysis.components.length;
      const allocatedCost = index === analysis.components.length - 1 ? Number((acquisitionCost - assigned).toFixed(2)) : Number(raw.toFixed(2));
      assigned += allocatedCost;
      const id = `part-${crypto.randomUUID()}`;
      return { id, slug: `${component.category}-${component.model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${id.slice(-6)}`, name: component.model || "Unknown component", category: component.category || "Unknown", brandModel: component.model || "Not entered", purchaseCost: allocatedCost, allocatedCost, estimatedResaleValue: component.expectedPartOutPrice, condition: component.condition || "Unknown", testingStatus: component.workingStatus || "Untested", currentStatus: "Available", storageLocation: "Not entered", notes: `Created from source transaction: ${analysis.title}. Valuation source: ${component.valuationSource}.`, sourceTransactionId: transactionId };
    });
    const transaction: SourceTransaction = { id: transactionId, analysisId, title: analysis.title, marketplace: analysis.marketplace, acquisitionCost, purchaseDate: new Date().toISOString().slice(0, 10), listingUrl: analysis.listingUrl, notes: analysis.notes, createdInventoryIds: parts.map((part) => part.id) };
    const updatedAnalysis = { ...analysis, status: "Part Out Started" as const, sourceTransactionId: transactionId };
    setData({ ...data, analyses: data.analyses.map((item) => item.id === analysisId ? updatedAnalysis : item), inventory: [...data.inventory, ...parts], sourceTransactions: [...data.sourceTransactions, transaction], auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: "Analysis converted to part out", relatedItem: analysis.title, newValue: `$${acquisitionCost.toFixed(2)} allocated across ${parts.length} parts`, source: "user" }] });
    return { ok: true, transaction };
  },
  createBuildFromAnalysis(analysisId: string, upgradePlan = false) {
    const analysis = data.analyses.find((item) => item.id === analysisId);
    if (!analysis || analysis.status && analysis.status !== "Analysis Only") return { ok: false, message: "This analysis has already been converted." };
    const cost = (analysis.askingPrice ?? 0) + (analysis.shipping ?? 0) + (analysis.tax ?? 0) + (analysis.buyerFees ?? 0) + (analysis.travelCost ?? 0) + (upgradePlan ? (analysis.repairCost ?? 0) : 0);
    if (cost <= 0) return { ok: false, message: "Add an acquisition cost before creating a build." };
    const id = `build-${crypto.randomUUID()}`;
    const build = { id, slug: analysis.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${id.slice(-6)}`, name: analysis.title, status: "Active" as const, buildCost: cost, marketplace: analysis.marketplace, notes: `${analysis.notes ?? ""}\nSource analysis: ${analysis.title}. Known issues: ${analysis.knownIssues ?? "Not entered"}`.trim(), partsNeeded: [], health: "Not assessed" as const };
    const task = { id: `task-${crypto.randomUUID()}`, title: `Test new build: ${analysis.title}`, buildId: id, relatedBuild: analysis.title, priority: "High" as const, status: "Open" as const, completed: false, notes: "Created from Buy vs Part Out conversion." };
    const updatedAnalysis = { ...analysis, status: upgradePlan ? "Upgrade Plan Created" as const : "Build Created" as const, createdBuildId: id };
    setData({ ...data, builds: [...data.builds, build], tasks: [...data.tasks, task], analyses: data.analyses.map((item) => item.id === analysisId ? updatedAnalysis : item), auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: upgradePlan ? "Upgrade plan created" : "Build created", relatedItem: analysis.title, newValue: `$${cost.toFixed(2)} invested`, source: "user" }] });
    return { ok: true, build };
  },
  recordPartSale(id: string, sale: NonNullable<InventoryItem["partSale"]>) {
    const item = data.inventory.find((entry) => entry.id === id);
    if (!item) return;
    if (item.currentStatus === "Sold" && item.partSale?.payoutConfirmed) return;
    const nextItem = { ...item, partSale: sale, currentStatus: sale.payoutConfirmed ? "Sold" : "Listed", availability: sale.payoutConfirmed ? "Unavailable" as const : item.availability };
    setData({ ...data, inventory: data.inventory.map((entry) => entry.id === id ? nextItem : entry), auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: sale.payoutConfirmed ? "Payout confirmed" : "Sale recorded, payout pending", relatedItem: item.name, newValue: sale.payout === undefined ? "Payout pending" : `$${sale.payout.toFixed(2)} payout`, source: "user" }] });
  },
  updateAllocations(transactionId: string, allocations: Record<string, number>, method: SourceTransaction["allocationMethod"]) {
    const transaction = data.sourceTransactions.find((item) => item.id === transactionId);
    if (!transaction) return { ok: false, message: "Source transaction not found." };
    const total = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    if (Object.values(allocations).some((value) => !Number.isFinite(value) || value < 0) || Math.abs(total - transaction.acquisitionCost) > 0.009) return { ok: false, message: "Allocations must equal the source acquisition cost exactly." };
    setData({ ...data, inventory: data.inventory.map((item) => item.sourceTransactionId === transactionId ? { ...item, allocatedCost: allocations[item.id], purchaseCost: allocations[item.id] } : item), sourceTransactions: data.sourceTransactions.map((item) => item.id === transactionId ? { ...item, allocationMethod: method } : item), auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: "Allocation edited", relatedItem: transaction.title, newValue: `$${total.toFixed(2)} allocated`, source: "user" }] });
    return { ok: true };
  },
  markPartReturned(id: string) {
    const item = data.inventory.find((entry) => entry.id === id);
    if (!item?.partSale) return;
    const next = { ...item, currentStatus: "Needs Testing", availability: "Restricted" as const, partSale: { ...item.partSale, status: "Returned" as const, returnStatus: "Returned" as const } };
    setData({ ...data, inventory: data.inventory.map((entry) => entry.id === id ? next : entry), auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: "Part returned", relatedItem: item.name, source: "user" }] });
  },
  updateListing(listing: MarketplaceListing) {
    setData({ ...data, listings: data.listings.map((item) => item.id === listing.id ? listing : item), auditEvents: [...data.auditEvents, { id: crypto.randomUUID(), date: new Date().toISOString(), action: "Listing updated", relatedItem: listing.title, newValue: listing.price === undefined ? listing.status : `$${listing.price.toFixed(2)} · ${listing.status}`, source: "user" }] });
  },
  saveDeal(deal: DealOpportunity) {
    const exists = data.dealOpportunities.some((item) => item.id === deal.id);
    setData({ ...data, dealOpportunities: exists ? data.dealOpportunities.map((item) => item.id === deal.id ? { ...deal, saved: true } : item) : [...data.dealOpportunities, { ...deal, saved: true }] });
  },
  ingestDiscoveredDeals(deals: DealOpportunity[]) {
    const byId = new Map(data.dealOpportunities.map((deal) => [deal.id, deal]));
    deals.forEach((incoming) => {
      const existing = byId.get(incoming.id);
      byId.set(incoming.id, existing ? { ...incoming, saved: existing.saved, dismissed: existing.dismissed, compatibleBuildIds: existing.compatibleBuildIds, offer: existing.offer } : incoming);
    });
    setData({ ...data, dealOpportunities: [...byId.values()] });
  },
  dismissDeal(id: string) { setData({ ...data, dealOpportunities: data.dealOpportunities.map((item) => item.id === id ? { ...item, dismissed: true } : item) }); },
  saveSearch(search: SavedDealSearch) { setData({ ...data, savedDealSearches: [...data.savedDealSearches.filter((item) => item.id !== search.id), search] }); },
  deleteSearch(id: string) { setData({ ...data, savedDealSearches: data.savedDealSearches.filter((item) => item.id !== id) }); },
  runSearch(id: string) {
    const search = data.savedDealSearches.find((item) => item.id === id); if (!search) return;
    const matched = data.dealOpportunities.filter((deal) => !deal.dismissed).map((deal) => matchSavedSearch(deal, search)).filter((result) => result.included);
    const matches = matched.map((result) => applySearchTargets(result.deal, search)); const count = matches.length;
    const updated = { ...search, lastChecked: new Date().toISOString(), lastResultCount: count, updatedAt: new Date().toISOString() };
    const normalized = data.dealOpportunities.map((deal) => matches.find((match) => match.id === deal.id) ?? deal);
    const qualified = matches.map((deal) => ({ deal, result: qualifiesForAlert(deal, search) })).filter((item) => item.result.passed);
    const alerts: DealAlert[] = [{ id: crypto.randomUUID(), title: `${search.name} checked`, description: `${count} series match${count === 1 ? "" : "es"} found. Series monitoring runs only while DealiX is open or when you manually run a search.`, type: "Below target", unread: true, createdAt: new Date().toISOString() }];
    qualified.forEach(({ deal, result }) => { const fingerprint = dealFingerprint(deal); const existing = data.dealAlerts.find((alert) => alert.fingerprint === fingerprint); if (!existing) alerts.push({ id: crypto.randomUUID(), dealId: deal.id, title: `${deal.detectedHardware?.model ?? deal.title} qualified`, description: `Qualified for ${search.name}: ${result.reasons.join(", ") || "it matches the series and active deal rules"}.`, type: "Below target", unread: true, createdAt: new Date().toISOString(), fingerprint, score: result.score.score, qualification: result.reasons, risks: result.score.risks }); });
    setData({ ...data, dealOpportunities: normalized, savedDealSearches: data.savedDealSearches.map((item) => item.id === id ? updated : item), dealAlerts: [...data.dealAlerts, ...alerts] });
  },
  watchDeal(dealId: string) {
    const deal = data.dealOpportunities.find((item) => item.id === dealId); if (!deal || data.watchlist.some((item) => item.dealId === dealId)) return;
    const score = scoreDeal(deal).score;
    setData({ ...data, watchlist: [...data.watchlist, { id: `watch-${crypto.randomUUID()}`, dealId, originalPrice: deal.askingPrice, currentPrice: deal.askingPrice, shipping: deal.shipping, availability: "Available", firstSeen: new Date().toISOString(), lastChecked: new Date().toISOString(), lowestObservedPrice: deal.askingPrice, highestObservedPrice: deal.askingPrice, priceChanges: [], targetPrice: deal.targetPrice, scoreHistory: [{ score, date: new Date().toISOString() }], listingStatus: "Watched" }] });
  },
  removeWatch(dealId: string) { setData({ ...data, watchlist: data.watchlist.filter((item) => item.dealId !== dealId) }); },
  updateDealOffer(dealId: string, offer: NonNullable<DealOpportunity["offer"]>) { setData({ ...data, dealOpportunities: data.dealOpportunities.map((item) => item.id === dealId ? { ...item, offer } : item) }); },
  assignDealToBuild(dealId: string, buildId: string) { setData({ ...data, dealOpportunities: data.dealOpportunities.map((item) => item.id === dealId ? { ...item, compatibleBuildIds: [...new Set([...(item.compatibleBuildIds ?? []), buildId])] } : item) }); },
  dismissDealAlert(id: string) { setData({ ...data, dealAlerts: data.dealAlerts.map((item) => item.id === id ? { ...item, dismissed: true, unread: false } : item) }); },
  markDealAlertRead(id: string) { setData({ ...data, dealAlerts: data.dealAlerts.map((item) => item.id === id ? { ...item, unread: false } : item) }); },
  saveTemplate(template: BuildTemplate) { setData({ ...data, templates: [...data.templates.filter((item) => item.id !== template.id), template] }); },
  cloneBuild(buildId: string) {
    const source = data.builds.find((item) => item.id === buildId);
    if (!source) return;
    const id = `build-${crypto.randomUUID()}`;
    const clone: Build = { ...source, id, slug: `${source.slug}-plan-${id.slice(-6)}`, name: `${source.name} Plan`, status: "Active", buildCost: 0, listingPrice: undefined, salePrice: undefined, mercariPayout: undefined, netProfit: undefined, parts: [], partsNeeded: ["CPU", "GPU", "RAM", "Storage", "PSU", "Case"].map((name) => ({ name, priority: "High" as const, status: "Needed", details: "Planning build: confirm an available asset or source this part." })), notes: `Planning clone of ${source.name}. Physical parts are not copied or assigned.`, listingDrafts: [] };
    this.addBuild(clone);
  },
  resetDemoData() {
    setData(createEmptyData());
  },
};

export function useDealiXData() {
  return useSyncExternalStore(dealixStore.subscribe, dealixStore.getSnapshot, () => serverSnapshot);
}

export function getDashboardMetrics(snapshot: DealiXData) {
  const soldBuilds = snapshot.builds.filter((build) => build.status === "Sold");
  const activeBuilds = snapshot.builds.filter((build) => build.status === "Active");
  const listedBuilds = snapshot.builds.filter((build) => build.status === "Listed");
  const confirmedNetProfit = soldBuilds.reduce((total, build) => total + (build.netProfit ?? 0), 0);
  const totalRecordedBuildCost = snapshot.builds.reduce((total, build) => total + build.buildCost, 0);

  return {
    confirmedNetProfit,
    completedSales: soldBuilds.length,
    activeBuilds: activeBuilds.length,
    listedBuilds: listedBuilds.length,
    openBuilds: activeBuilds.length + listedBuilds.length,
    totalRecordedBuildCost,
    pendingTasks: snapshot.tasks.filter((task) => !task.completed).length,
    unreadNotifications: snapshot.notifications.filter((notification) => notification.unread && !notification.dismissed).length,
  };
}

export function createDefaultTestingResult(buildId: string): TestingResult {
  return {
    buildId,
    checklist: structuredClone(testingChecklist),
    notes: "Starting the workflow for the active build.",
    cpuTemp: "",
    gpuTemp: "",
    benchmark: "",
    failedPart: "",
    createRepairTask: true,
  };
}
