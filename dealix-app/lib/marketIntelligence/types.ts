import type { DealAlert, DealOpportunity, NotificationItem, SavedDealSearch, Settings, WatchlistItem } from "@/types";

export interface MarketIntelligenceSnapshot {
  savedDealSearches: SavedDealSearch[];
  dealOpportunities: DealOpportunity[];
  watchlist: WatchlistItem[];
  dealAlerts: DealAlert[];
  notifications: NotificationItem[];
  preferences: Pick<Settings, "dealAlertFrequency" | "minimumTargetProfit" | "preferredParts" | "emailAlerts" | "discordAlerts">;
}
