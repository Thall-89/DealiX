"use client";

import { useEffect } from "react";
import { secureRequestHeaders } from "@/lib/security/client";
import { supabaseConfigured } from "@/lib/supabase/client";
import { dealixStore, type DealiXData } from "@/lib/store";
import type { MarketIntelligenceSnapshot } from "@/lib/marketIntelligence/types";

function snapshotFrom(data: DealiXData): MarketIntelligenceSnapshot {
  const { dealAlertFrequency, minimumTargetProfit, preferredParts, emailAlerts, discordAlerts } = data.settings;
  return { savedDealSearches: data.savedDealSearches, dealOpportunities: data.dealOpportunities, watchlist: data.watchlist, dealAlerts: data.dealAlerts, notifications: data.notifications, preferences: { dealAlertFrequency, minimumTargetProfit, preferredParts, emailAlerts, discordAlerts } };
}

/** Keeps only Market Intelligence data server-backed. The rest of the app keeps
 * its existing migration path while its entity repositories are rolled out. */
export function MarketIntelligenceSync() {
  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    let hydrated = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const save = async () => {
      if (cancelled || !hydrated) return;
      try {
        const headers = await secureRequestHeaders();
        await fetch("/api/market-intelligence/snapshot", { method: "PUT", headers, body: JSON.stringify(snapshotFrom(dealixStore.getSnapshot())), keepalive: true });
      } catch {
        // Local data remains intact; the next change retries the cloud sync.
      }
    };

    const unsubscribe = dealixStore.subscribe(() => {
      if (!hydrated) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, 750);
    });

    const refresh = async () => {
      try {
        const headers = await secureRequestHeaders();
        const response = await fetch("/api/market-intelligence/snapshot", { headers, cache: "no-store" });
        const payload = await response.json() as { snapshot?: MarketIntelligenceSnapshot | null };
        if (!cancelled && response.ok && payload.snapshot) dealixStore.hydrateMarketIntelligence(payload.snapshot);
      } catch {
        // Development, offline use, and an unconfigured backend remain usable.
      } finally {
        hydrated = true;
      }
    };
    void refresh();
    const refreshTimer = window.setInterval(() => { void refresh(); }, 30_000);

    return () => { cancelled = true; window.clearInterval(refreshTimer); if (timer) clearTimeout(timer); unsubscribe(); };
  }, []);
  return null;
}
