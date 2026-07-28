"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/mockData";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeProvider";
import { useAuthIdentity } from "@/components/AuthIdentity";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const metrics = getDashboardMetrics(useDealiXData());
  const { preferredName } = useAuthIdentity();

  const links = navItems;

  return (
    <aside className={`w-full shrink-0 rounded-[28px] border border-white/10 bg-slate-950/60 p-4 shadow-[0_24px_80px_rgba(2,12,27,0.38)] backdrop-blur-xl lg:w-72 lg:p-5 ${mobileOpen ? "block" : "hidden lg:block"}`}>
      <div className="mb-7 flex min-h-12 items-center justify-between gap-3">
        <Image src="/brand/dealix-logo-dark.svg" alt="DealiX" width={156} height={29} priority className="brand-logo-dark h-auto w-[156px] max-w-full object-contain object-left" />
        <Image src="/brand/dealix-logo-light.svg" alt="DealiX" width={156} height={29} priority className="brand-logo-light h-auto w-[156px] max-w-full object-contain object-left" />
        {onClose ? (
          <button aria-label="Close navigation" onClick={onClose} className="min-h-10 rounded-full border border-white/10 px-3 text-zinc-400 transition hover:border-white/20 hover:text-white active:scale-[0.98] lg:hidden">
            ×
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active ? "bg-sky-500/15 text-sky-200" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}`}
            >
              <span>{item.label}</span>
              {active ? <span className="text-sky-300">●</span> : null}
            </Link>
          );
        })}
      </nav>

      {mobileOpen ? <div className="mt-5 lg:hidden"><ThemeToggle compact /></div> : null}

      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-white">{preferredName}&apos;s Snapshot</div>
        <div className="mt-3 space-y-2 text-sm text-zinc-400">
          <div className="flex items-center justify-between"><span>Confirmed Profit</span><span className="text-white">${metrics.confirmedNetProfit.toFixed(2)}</span></div>
          <div className="flex items-center justify-between"><span>Active Builds</span><span className="text-white">{metrics.activeBuilds}</span></div>
          <div className="flex items-center justify-between"><span>Listed Builds</span><span className="text-white">{metrics.listedBuilds}</span></div>
          <div className="flex items-center justify-between"><span>Pending Tasks</span><span className="text-white">{metrics.pendingTasks}</span></div>
          <div className="flex items-center justify-between"><span>Unread Alerts</span><span className="text-white">{metrics.unreadNotifications}</span></div>
        </div>
      </div>
    </aside>
  );
}
