export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type StoredMarketRecord = { id: string; user_id: string; client_key: string | null; data: Json; created_at: string; updated_at: string };
type StoredMarketInsert = { id?: string; user_id: string; client_key?: string | null; data?: Json; created_at?: string; updated_at?: string };
type StoredMarketUpdate = { client_key?: string | null; data?: Json; updated_at?: string };
export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: { id: string; user_id: string; data: Json; settings: Json; notification_preferences: Json; tax_rate: number | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; data?: Json; settings?: Json; notification_preferences?: Json; tax_rate?: number | null; created_at?: string; updated_at?: string };
        Update: { data?: Json; settings?: Json; notification_preferences?: Json; tax_rate?: number | null; updated_at?: string };
        Relationships: [];
      };
      profiles: { Row: { id: string; user_id: string | null; username: string; display_name: string | null; avatar_url: string | null; bio: string | null; theme: "dark" | "light"; has_logged_in_before: boolean; preferred_currency: string; timezone: string; created_at: string | null; updated_at: string }; Insert: { id: string; user_id?: string | null; username?: string; display_name?: string | null; avatar_url?: string | null; bio?: string | null; theme?: "dark" | "light"; has_logged_in_before?: boolean; preferred_currency?: string; timezone?: string }; Update: { username?: string; display_name?: string | null; avatar_url?: string | null; bio?: string | null; theme?: "dark" | "light"; has_logged_in_before?: boolean; preferred_currency?: string; timezone?: string }; Relationships: [] };
      audit_events: { Row: { id: string; user_id: string; action: string; related_type: string | null; related_id: string | null; old_value: Json | null; new_value: Json | null; event_source: string; occurred_at: string; created_at: string; updated_at: string }; Insert: { id?: string; user_id: string; action?: string; related_type?: string | null; related_id?: string | null; old_value?: Json | null; new_value?: Json | null; event_source?: string; occurred_at?: string; created_at?: string; updated_at?: string }; Update: never; Relationships: [] };
      saved_searches: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      marketplace_results: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      watchlist_items: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      deal_alerts: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      alert_fingerprints: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      notifications: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
      monitor_runs: { Row: StoredMarketRecord; Insert: StoredMarketInsert; Update: StoredMarketUpdate; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { build_status: "Active" | "Listed" | "Sold"; asset_availability: "Available" | "Unavailable" | "Restricted" | "Unknown"; task_status: "Open" | "In Progress" | "Blocked" | "Completed"; part_sale_status: "Not Listed" | "Listed" | "Offer Received" | "Pending Sale" | "Sold" | "Paid" | "Refunded" | "Returned" | "Cancelled" | "Archived"; marketplace_listing_status: "Draft" | "Active" | "Needs Price Confirmation" | "Offer Received" | "Pending Sale" | "Sold" | "Ended" | "Paused" | "Removed"; monitor_run_status: "Running" | "Completed" | "Failed" | "Skipped"; };
    CompositeTypes: Record<string, never>;
  };
}
