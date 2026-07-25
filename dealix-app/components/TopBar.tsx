"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">DealiX</div>
          <div className="text-xs text-zinc-500">Operations OS</div>
        </div>
        <div className="flex-1 lg:max-w-xl">
          <SearchBar />
        </div>
        <button onClick={() => setMobileOpen((prev) => !prev)} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 lg:hidden">
          Menu
        </button>
      </div>
      {mobileOpen ? <Sidebar mobileOpen={true} onClose={() => setMobileOpen(false)} /> : null}
    </div>
  );
}
