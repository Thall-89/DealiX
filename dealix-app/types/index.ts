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

