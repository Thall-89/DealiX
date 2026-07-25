'use client';

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { dealixStore, useDealiXData } from "@/lib/store";

export default function SettingsPage() {
  const { settings } = useDealiXData();
  const [saveMessage, setSaveMessage] = useState("");
  const updateSettings = (next: typeof settings) => {
    dealixStore.updateSettings(next);
    setSaveMessage("Settings saved in this browser.");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" description="Adjust mock preferences and review future integrations for the product." />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Profile and workflow</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Profile name</div>
              <input value={settings.profileName} onChange={(event) => updateSettings({ ...settings, profileName: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Preferred currency</div>
              <input value={settings.preferredCurrency} onChange={(event) => updateSettings({ ...settings, preferredCurrency: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Default marketplace</div>
              <input value={settings.defaultMarketplace} onChange={(event) => updateSettings({ ...settings, defaultMarketplace: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Deal alert frequency</div>
              <input value={settings.dealAlertFrequency} onChange={(event) => updateSettings({ ...settings, dealAlertFrequency: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <span>Discord alerts</span>
              <input type="checkbox" checked={settings.discordAlerts} onChange={() => updateSettings({ ...settings, discordAlerts: !settings.discordAlerts })} className="h-4 w-4 accent-sky-500" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <span>Email alerts</span>
              <input type="checkbox" checked={settings.emailAlerts} onChange={() => updateSettings({ ...settings, emailAlerts: !settings.emailAlerts })} className="h-4 w-4 accent-sky-500" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <span>Dark mode</span>
              <input type="checkbox" checked={settings.darkMode} onChange={() => updateSettings({ ...settings, darkMode: !settings.darkMode })} className="h-4 w-4 accent-sky-500" />
            </label>
          </div>
          <label className="mt-4 block rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Minimum target profit</div>
            <input type="number" value={settings.minimumTargetProfit} onChange={(event) => updateSettings({ ...settings, minimumTargetProfit: Number(event.target.value) })} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Preferred parts</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {settings.preferredParts.map((part) => (
                <span key={part} className="rounded-full border border-white/10 px-2.5 py-1 text-xs">{part}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-6 text-sm text-amber-100">
          <div className="font-semibold">Reset Demo Data</div>
          <p className="mt-2 text-amber-200/90">Restore all original builds, inventory, tasks, notifications, settings, and testing results in this browser.</p>
          <button onClick={() => { if (window.confirm("Reset all DealiX demo data in this browser? This cannot be undone.")) { dealixStore.resetDemoData(); setSaveMessage("Demo data restored."); } }} className="mt-4 rounded-full border border-amber-300/30 px-4 py-2 text-sm font-medium text-amber-100">Reset Demo Data</button>
          {saveMessage ? <div className="mt-3 font-medium text-emerald-300">{saveMessage}</div> : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Future integrations</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            {[
              ["Supabase", "Not Connected"],
              ["eBay", "Not Connected"],
              ["Discord", "Not Connected"],
              ["Vercel", "Not Connected"],
              ["AI provider", "Not Connected"],
            ].map(([name, status]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>{name}</span>
                <span className="text-amber-300">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
