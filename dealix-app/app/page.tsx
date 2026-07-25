'use client'

import React, { useState, useEffect } from "react";

type Build = {
  id: string;
  name: string;
  status: string;
  buildCost: number;
  salePrice?: number;
  mercariPayout?: number;
  netProfit?: number;
  estimatedResale?: string;
  projectedProfit?: string;
  listingPrice?: number;
  expectedSale?: string;
};

export default function Home() {
  const initialBuilds: Build[] = [
    {
      id: "1",
      name: "i5-12600K + RTX 4060 Gaming PC",
      status: "Sold",
      buildCost: 614.5,
      salePrice: 997.0,
      mercariPayout: 859.0,
      netProfit: 244.5,
    },
    {
      id: "2",
      name: "Legacy Powerhouse",
      status: "Active",
      buildCost: 365.5,
      estimatedResale: "550-599",
      projectedProfit: "134.5-204.5",
    },
    {
      id: "3",
      name: "Blue Titan",
      status: "Listed",
      buildCost: 715.0,
      listingPrice: 999.0,
      expectedSale: "925-975",
      projectedProfit: "210-260",
    },
  ];

  const [builds] = useState<Build[]>(initialBuilds);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [actions, setActions] = useState(
    () => {
      // initialize actions (kept client-only)
      const list = [
        { id: "a1", text: "Review Blue Titan pricing", done: false },
        { id: "a2", text: "Add missing final sale data for Legacy Powerhouse", done: false },
        { id: "a3", text: "Enter current loose-parts inventory", done: false },
        { id: "a4", text: "Confirm where the RTX 3070 from Build #1 went", done: false },
      ];
      try {
        const raw = localStorage.getItem("dealiX_actions_v1");
        if (raw) return JSON.parse(raw);
      } catch (e) {
        // ignore parse errors
      }
      return list;
    }
  );
n  useEffect(() => {
    try {
      localStorage.setItem("dealiX_actions_v1", JSON.stringify(actions));
    } catch (e) {
      // ignore storage errors
    }
  }, [actions]);
n  const toggleCollapse = (id: string) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  };
n  const toggleAction = (id: string) => {
    setActions((prev: any[]) => prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  };
n  const stats = {
    confirmedNetProfit: 244.5,
    completedSales: 1,
    activeBuilds: 2,
    totalRecordedBuildCost: 1695.0, // 614.5 + 365.5 + 715.0
  };
n  const statusBadge = (s: string) => {
    if (s === "Sold") return <span className="badge badge-sold">Sold</span>;
    if (s === "Active") return <span className="badge badge-active">Active</span>;
    if (s === "Listed") return <span className="badge badge-listed">Listed</span>;
    return <span className="badge">{s}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060608] via-[#0b0b0c] to-[#050507] text-zinc-100 antialiased">
      <main className="max-w-7xl mx-auto p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="w-full sm:w-2/3">
            <h1 className="text-4xl font-extrabold tracking-tight">DealiX</h1>
            <div className="mt-3 text-zinc-300 leading-relaxed text-base header-intro">
              <p className="mb-3">Good morning, Tristen.</p>
              <p className="mb-2">Here’s what’s happening with your PC flipping business today.</p>
              <p className="mb-1">You currently have <strong>{stats.activeBuilds}</strong> active builds, <strong>{stats.completedSales}</strong> completed sale, and at least <strong>${stats.confirmedNetProfit.toFixed(2)}</strong> in confirmed profit from Build #1.</p>
              <p className="mb-1">Blue Titan is still active and should be monitored for pricing. Legacy Powerhouse still needs final sale data. Your next goal is to organize inventory and track every part accurately.</p>
            </div>
          </div>

          <div className="w-full sm:w-1/3 flex items-start sm:items-center justify-end gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 w-full">
              <div className="card card-compact flex flex-col p-3">
                <div className="text-zinc-300 text-xs">Confirmed Net Profit</div>
                <div className="mt-2 text-lg font-semibold">${stats.confirmedNetProfit.toFixed(2)}</div>
              </div>

              <div className="card card-compact flex flex-col p-3">
                <div className="text-zinc-300 text-xs">Completed Sales</div>
                <div className="mt-2 text-lg font-semibold">{stats.completedSales}</div>
              </div>

              <div className="card card-compact flex flex-col p-3">
                <div className="text-zinc-300 text-xs">Active Builds</div>
                <div className="mt-2 text-lg font-semibold">{stats.activeBuilds}</div>
              </div>

              <div className="card card-compact flex flex-col p-3">
                <div className="text-zinc-300 text-xs">Total Recorded Build Cost</div>
                <div className="mt-2 text-lg font-semibold">${stats.totalRecordedBuildCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="mt-2 text-xs text-zinc-400">Breakdown: $614.50, $365.50, $715.00</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-800/40 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Builds</h2>
                <div className="text-sm text-zinc-400">Showing 3 builds</div>
              </div>

              <div className="space-y-3">
                {builds.map((b) => {
                  const isCollapsed = !!collapsed[b.id];
                  return (
                    <div key={b.id} className="p-4 bg-zinc-900/40 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 justify-between sm:justify-start">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{b.name}</div>
                            <div>{statusBadge(b.status)}</div>
                          </div>

                          <div className="sm:ml-4">
                            <button aria-expanded={!isCollapsed} onClick={() => toggleCollapse(b.id)} className="text-sm text-zinc-300 hover:underline">
                              {isCollapsed ? "Show details" : "Hide details"}
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="mt-2 text-sm text-zinc-400">
                            {b.status === "Sold" && (
                              <>
                                <div>Build cost: ${b.buildCost.toFixed(2)}</div>
                                <div>Sale price: ${b.salePrice!.toFixed(2)}</div>
                                <div>Mercari payout: ${b.mercariPayout!.toFixed(2)}</div>
                                <div className="mt-1">Net profit: <strong>${b.netProfit!.toFixed(2)}</strong></div>
                              </>
                            )}

                            {b.status === "Active" && (
                              <>
                                <div>Build cost: ${b.buildCost.toFixed(2)}</div>
                                <div>Estimated resale: {b.estimatedResale}</div>
                                <div>Projected profit: {b.projectedProfit}</div>
                              </>
                            )}

                            {b.status === "Listed" && (
                              <>
                                <div>Build cost: ${b.buildCost.toFixed(2)}</div>
                                <div>Listing price: ${b.listingPrice!.toFixed(2)}</div>
                                <div>Expected sale price: {b.expectedSale}</div>
                                <div>Projected profit: {b.projectedProfit}</div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
n                      <div className="text-sm text-zinc-400 sm:text-right flex-shrink-0">
                        {/* Right column can show compact summary */}
                        {b.status === "Sold" && <div className="font-medium text-green-400">${b.netProfit!.toFixed(2)}</div>}
                        {b.status !== "Sold" && <div className="text-zinc-300">Build cost: ${b.buildCost.toFixed(2)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-800/30 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Today's Focus</h3>
              <p className="text-sm text-zinc-300">Organize inventory, track every part accurately, and confirm final sale data for Legacy Powerhouse.</p>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                <ul className="list-none text-sm text-zinc-300 space-y-2">
                  {actions.map((a: any) => (
                    <li key={a.id} className={`flex items-center gap-3 ${a.done ? "opacity-60 line-through" : ""}`}>
                      <input id={`act-${a.id}`} aria-checked={a.done} type="checkbox" checked={a.done} onChange={() => toggleAction(a.id)} className="w-4 h-4 rounded" />
                      <label htmlFor={`act-${a.id}`} className="select-none">{a.text}</label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="bg-zinc-800/40 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Quick Summary</h3>
            <div className="text-sm text-zinc-300 space-y-2">
              <div>Confirmed Net Profit: <strong>${stats.confirmedNetProfit.toFixed(2)}</strong></div>
              <div>Completed Sales: <strong>{stats.completedSales}</strong></div>
              <div>Active Builds: <strong>{stats.activeBuilds}</strong></div>
              <div>Total Recorded Build Cost: <strong>${stats.totalRecordedBuildCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
