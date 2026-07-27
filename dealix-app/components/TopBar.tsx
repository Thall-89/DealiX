"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { useDealiXData } from "@/lib/store";

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notifications } = useDealiXData();
  const unread = notifications.filter((item) => item.unread && !item.dismissed).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-h-10 items-center">
          <Image src="/brand/dealix-icon-white.svg" alt="DealiX" width={36} height={36} priority className="h-9 w-9 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/[0.08] sm:hidden" />
          <Image src="/brand/dealix-logo-dark.svg" alt="DealiX" width={144} height={27} priority className="hidden h-auto w-36 object-contain object-left sm:block" />
        </div>
        <div className="flex-1 lg:max-w-xl">
          <SearchBar />
        </div>
        <div className="flex gap-2"><Link href="/notifications" aria-label={`${unread} unread alerts`} className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5 active:scale-[0.98]">Alerts {unread ? `(${unread})` : ""}</Link><button aria-expanded={mobileOpen} aria-label="Toggle navigation menu" onClick={() => setMobileOpen((prev) => !prev)} className="min-h-10 rounded-full border border-white/10 px-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5 active:scale-[0.98] lg:hidden">Menu</button></div>
      </div>
      {mobileOpen ? <Sidebar mobileOpen={true} onClose={() => setMobileOpen(false)} /> : null}
    </div>
  );
}
