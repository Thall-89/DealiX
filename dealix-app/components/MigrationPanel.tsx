"use client";

import { useState } from "react";
import { previewMigration } from "@/lib/data/migration";
import { supabaseRepository } from "@/lib/data/supabaseRepository";
import { secureRequestHeaders } from "@/lib/security/client";
import { dealixStore, type DealiXData, useDealiXData } from "@/lib/store";
import type { MarketIntelligenceSnapshot } from "@/lib/marketIntelligence/types";

function marketSnapshot(data: DealiXData): MarketIntelligenceSnapshot {
  const { dealAlertFrequency, minimumTargetProfit, preferredParts, emailAlerts, discordAlerts } = data.settings;
  return { savedDealSearches: data.savedDealSearches, dealOpportunities: data.dealOpportunities, watchlist: data.watchlist, dealAlerts: data.dealAlerts, notifications: data.notifications, preferences: { dealAlertFrequency, minimumTargetProfit, preferredParts, emailAlerts, discordAlerts } };
}

export function MigrationPanel() {
  const data = useDealiXData();
  const [status, setStatus] = useState("");
  const preview = previewMigration(data);
  const backup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dealix-local-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("Local JSON backup downloaded.");
  };
  const migrate = async () => {
    if (!window.confirm("Upload this local snapshot to your signed-in Supabase account? Local data will remain untouched.")) return;
    try {
      setStatus("Saving secure cloud data…");
      const snapshot = dealixStore.getSnapshot();
      await supabaseRepository.save(snapshot);
      const response = await fetch("/api/market-intelligence/snapshot", { method: "PUT", headers: await secureRequestHeaders(), body: JSON.stringify(marketSnapshot(snapshot)) });
      if (!response.ok) throw new Error("The general cloud snapshot was saved, but Market Intelligence records could not be migrated.");
      setStatus("Migration complete. Local data was preserved.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Migration failed."); }
  };
  return <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"><h2 className="font-semibold text-white">Local data migration</h2><p className="mt-1 text-sm text-zinc-400">Preview, back up, then upload your local browser data without deleting it.</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">{Object.entries(preview.recordCounts).map(([name, count]) => <span key={name} className="rounded-full bg-white/5 px-3 py-1">{name}: {count}</span>)}</div>{preview.warnings.map((warning) => <p key={warning} className="mt-2 text-xs text-amber-200">{warning}</p>)}<div className="mt-4 flex gap-2"><button onClick={backup} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200">Export backup</button><button disabled={!supabaseRepository.configured} onClick={migrate} className="rounded-full bg-sky-500 px-4 py-2 text-sm text-white disabled:opacity-50">Upload after confirmation</button></div>{status ? <p className="mt-3 text-sm text-sky-200">{status}</p> : null}</section>;
}
