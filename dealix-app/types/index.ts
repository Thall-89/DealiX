export type BuildStatus = "Sold" | "Active" | "Listed";

export interface BuildPart {
  name: string;
  type: string;
  condition: string;
  serialNumber?: string;
  purchasePrice?: number;
  seller?: string;
  purchaseDate?: string;
  warranty?: string;
  assignedBuild?: string;
  testingHistory?: string[];
  currentLocation?: string;
  notes?: string;
}

export interface BuildTimelineEvent {
  label: string;
  completed: boolean;
  date?: string;
}

export interface BuildBenchmark {
  cinebench?: string;
  threeDMark?: string;
  crystalDiskMark?: string;
  cpuIdleTemp?: string;
  cpuLoadTemp?: string;
  gpuIdleTemp?: string;
  gpuLoadTemp?: string;
  status?: "Pass" | "Fail" | "Not entered";
  notes?: string;
}

export interface BuildPhotoSet {
  mainPhoto?: string;
  insideCase?: string;
  gpu?: string;
  cableManagement?: string;
  benchmarkScreenshot?: string;
  windowsScreenshot?: string;
}

export interface BuildProfitBreakdown {
  salePrice?: number;
  marketplaceFees?: number;
  shipping?: number;
  taxes?: number;
  buildCost?: number;
  payout?: number;
  netProfit?: number;
  roi?: string;
  profitMargin?: string;
  marketplace?: string;
  acceptedOffer?: string;
  listingPrice?: number;
}

export type ListingMarketplace = "Facebook Marketplace" | "eBay" | "Mercari" | "Jawa" | "Craigslist";

export interface ListingDraft {
  id: string;
  marketplace: ListingMarketplace;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Build {
  id: string;
  slug: string;
  name: string;
  status: BuildStatus;
  buildCost: number;
  salePrice?: number;
  mercariPayout?: number;
  netProfit?: number;
  estimatedResale?: string;
  projectedProfit?: string;
  listingPrice?: number;
  expectedSale?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  psu?: string;
  motherboard?: string;
  case?: string;
  cooling?: string;
  os?: string;
  windowsActivation?: string;
  accessories?: string;
  workCompleted?: string[];
  partsNeeded?: Array<{
    name: string;
    priority: "High" | "Medium" | "Low";
    status: string;
    details: string;
  }>;
  startDate?: string;
  completionDate?: string;
  listingDate?: string;
  saleDate?: string;
  lastUpdated?: string;
  notes?: string;
  parts?: BuildPart[];
  timeline?: BuildTimelineEvent[];
  photos?: BuildPhotoSet;
  benchmarking?: BuildBenchmark;
  profitBreakdown?: BuildProfitBreakdown;
  marketplace?: string;
  acceptedOffer?: string;
  health?: "Ready" | "Needs attention" | "Blocked" | "Not assessed";
  listingDrafts?: ListingDraft[];
  createdAt?: string;
  updatedAt?: string;
  finalizedAt?: string;
  archivedAt?: string;
  favorite?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brandModel: string;
  purchaseCost: number;
  condition: string;
  testingStatus: string;
  currentStatus: string;
  storageLocation: string;
  assignedBuild?: string;
  locationNote?: string;
  serialNumber?: string;
  seller?: string;
  purchaseDate?: string;
  warranty?: string;
  notes?: string;
  slug?: string;
  sourceTransactionId?: string;
  allocatedCost?: number;
  estimatedResaleValue?: number;
  partSale?: { listingPrice?: number; acceptedSalePrice?: number; marketplace: string; sellingFee?: number; shipping?: number; otherExpenses?: number; payout?: number; payoutConfirmed: boolean; saleDate?: string; buyerNotes?: string; trackingNumber?: string; returnStatus?: "Not Returned" | "Refunded" | "Returned"; refundAmount?: number; notes?: string; status: "Not Listed" | "Listed" | "Offer Received" | "Pending Sale" | "Sold" | "Paid" | "Refunded" | "Returned" | "Cancelled" | "Archived" };
  availability?: "Available" | "Unavailable" | "Restricted" | "Unknown";
  personalPc?: boolean;
  quantity?: number;
  assetHistory?: Array<{ action: string; note?: string; date?: string }>;
  archivedAt?: string;
  receiptReference?: string;
  updatedAt?: string;
}

export interface MarketplaceListing {
  id: string;
  buildId: string;
  marketplace: string;
  title: string;
  price?: number;
  status: "Draft" | "Active" | "Needs Price Confirmation" | "Offer Received" | "Pending Sale" | "Sold" | "Ended" | "Paused" | "Removed";
  url?: string;
  estimatedFee?: number;
  sellerShipping?: number;
  views?: number;
  offers?: number;
  bestOffer?: number;
  lastUpdated: string;
  notes?: string;
  priceHistory?: Array<{ price?: number; date: string; note?: string }>;
}

export interface BuildTemplate {
  id: string;
  sourceBuildId: string;
  name: string;
  targetCost?: number;
  targetResale?: number;
  targetProfit?: number;
  targetRoi?: number;
  specifications: Pick<Build, "cpu" | "gpu" | "ram" | "storage" | "psu" | "case" | "cooling">;
}

export interface Deal {
  id: string;
  marketplace: string;
  title: string;
  listingPrice: number;
  estimatedMarketValue: number;
  estimatedFees: number;
  estimatedShipping: number;
  estimatedProfit: number;
  riskLevel: "Low" | "Medium" | "High";
  flipScore: number;
  sellerRating: string;
  category: string;
  note: string;
}

export interface AiMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export interface TestingChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export type DealSourceType = "Mock" | "Manual" | "Saved snapshot" | "Live";
export type DealScoreLabel = "Excellent" | "Good" | "Fair" | "Poor";
export type DealRiskLabel = "Low" | "Medium" | "High" | "Critical";
export type DealCompatibilityLabel = "Compatible" | "Compatible with Warning" | "Unknown" | "Not Compatible";
export type DealConfidenceLabel = "High" | "Medium" | "Low" | "Insufficient Data";
export type DealUrgencyLabel = "Review Now" | "Review Soon" | "Watch" | "Low Priority";

export interface DealOffer {
  askingPrice?: number; suggestedOpeningOffer?: number; targetPurchasePrice?: number; maximumPurchasePrice?: number; walkAwayPrice?: number; counteroffer?: number; finalAcceptedPrice?: number;
  status: "Not Contacted" | "Offer Planned" | "Offer Sent" | "Counter Received" | "Accepted" | "Declined" | "Purchased" | "Expired";
  followUpDate?: string; sellerResponse?: string; notes?: string;
}

export interface DealOpportunity {
  id: string; title: string; marketplace: string; listingType: string; category: string; sourceType: DealSourceType;
  providerId?: string; externalListingId?: string;
  askingPrice?: number; shipping?: number; estimatedTax?: number; buyerFees?: number; travelCost?: number; condition?: string;
  sellerName?: string; sellerRating?: number; returnPolicy?: string; offersEnabled?: boolean; imageUrl?: string; listingUrl?: string; location?: string;
  dateFound: string; lastChecked: string; estimatedResaleValue?: number; estimatedSellingFees?: number; estimatedSellerShipping?: number; estimatedRepairCost?: number;
  targetPrice?: number; compatibleBuildIds?: string[]; missingPartCompleted?: string; compatibility: DealCompatibilityLabel; compatibilityExplanation?: string;
  firstSeen?: string; lowestObservedPrice?: number; highestObservedPrice?: number; averageObservedPrice?: number; timesSeen?: number;
  upgradePotential?: string; partOutValue?: number; templateId?: string; testingStatus?: string; saved?: boolean; dismissed?: boolean; offer?: DealOffer;
  detectedHardware?: { manufacturer?: string; series?: string; model?: string; confidence: DealConfidenceLabel; evidence: string[]; ambiguityWarning?: string };
  targetSource?: "Exact model" | "Saved search" | "Series" | "Category";
}

export interface SavedDealSearch {
  id: string; name: string; category: string; terms: string; marketplace: string; condition: "Any" | "New" | "Used";
  maximumItemPrice?: number; maximumLandedCost?: number; minimumExpectedProfit?: number; minimumRoi?: number; minimumOpportunityScore?: number; minimumSellerRating?: number;
  targetPrice?: number;
  seriesTargetPrice?: number; exactModelIncludes?: string[]; exactModelExcludes?: string[]; allowForParts?: boolean; excludeLaptopGpu?: boolean; excludeAccessories?: boolean;
  requireAllRules?: boolean; minimumConfidence?: DealConfidenceLabel;
  returnsRequired: boolean; offersEnabled?: boolean; fulfillment: "Any" | "Local pickup" | "Shipping"; maximumDistance?: number;
  compatibleBuildId?: string; platform?: string; socket?: string; gpuManufacturer?: string; gpuGeneration?: string; cpuManufacturer?: string; cpuPlatform?: string;
  riskThreshold: DealRiskLabel; notificationEnabled: boolean; active: boolean; lastChecked?: string; lastResultCount?: number; createdAt: string; updatedAt: string;
}

export interface WatchlistItem {
  id: string; dealId: string; originalPrice?: number; currentPrice?: number; shipping?: number; landedCost?: number; availability: "Available" | "Sold" | "Removed" | "Unknown";
  firstSeen: string; lastChecked: string; lowestObservedPrice?: number; highestObservedPrice?: number; priceChanges: Array<{ price?: number; date: string }>;
  notes?: string; interestedBuildId?: string; targetPrice?: number; scoreHistory: Array<{ score: number; date: string }>; listingStatus: string;
}

export interface DealAlert {
  id: string; dealId?: string; title: string; description: string; type: "Below target" | "Price dropped" | "ROI goal" | "Compatible part" | "Build unblocked" | "Offer" | "Listing removed" | "Risk increased";
  unread: boolean; dismissed?: boolean; snoozedUntil?: string; createdAt: string;
  fingerprint?: string; score?: number; qualification?: string[]; risks?: string[];
}

export interface TestingResult {
  buildId: string;
  checklist: TestingChecklistItem[];
  notes: string;
  cpuTemp: string;
  gpuTemp: string;
  benchmark: string;
  failedPart: string;
  createRepairTask?: boolean;
}

export interface Settings {
  profileName: string;
  preferredCurrency: string;
  defaultMarketplace: string;
  discordAlerts: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  dealAlertFrequency: string;
  minimumTargetProfit: number;
  preferredParts: string[];
  onboardingDismissed: boolean;
}

export interface PartOutComponent {
  id: string;
  category: string;
  model: string;
  condition: string;
  workingStatus: string;
  expectedPartOutPrice?: number;
  marketplaceFees?: number;
  shippingCost?: number;
  confidence: "High" | "Medium" | "Low" | "Unknown";
  valuationSource: string;
}

export interface BuyVsPartOutAnalysis {
  id: string;
  title: string;
  marketplace: string;
  askingPrice?: number;
  shipping?: number;
  tax?: number;
  buyerFees?: number;
  travelCost?: number;
  repairCost?: number;
  wholeResaleValue?: number;
  upgradedResaleValue?: number;
  sellingFees?: number;
  sellerShipping?: number;
  condition: string;
  sellerRating?: string;
  returnPolicy?: string;
  location?: string;
  knownIssues?: string;
  testStatus?: string;
  notes?: string;
  listingUrl?: string;
  components: PartOutComponent[];
  createdAt: string;
  status?: "Analysis Only" | "Part Out Started" | "Build Created" | "Upgrade Plan Created" | "Completed" | "Cancelled";
  sourceTransactionId?: string;
  createdBuildId?: string;
}

export interface SourceTransaction {
  id: string;
  analysisId: string;
  title: string;
  marketplace: string;
  acquisitionCost: number;
  purchaseDate: string;
  seller?: string;
  listingUrl?: string;
  notes?: string;
  createdInventoryIds: string[];
  allocationMethod?: "Equal split" | "Proportional by estimated resale value" | "Manual Dollar Allocation" | "Custom Percentage Allocation";
  conversionDate?: string;
}

export interface AuditEvent {
  id: string;
  date: string;
  action: string;
  relatedItem: string;
  oldValue?: string;
  newValue?: string;
  source: "user" | "system";
}

export interface TaskItem {
  id: string;
  title: string;
  buildId?: string;
  relatedBuild?: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Blocked" | "Completed";
  dueDate?: string;
  completed: boolean;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  unread: boolean;
  dismissed?: boolean;
}

