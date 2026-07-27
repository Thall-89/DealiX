import type { ReactNode } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MarketIntelligenceSync } from "@/components/MarketIntelligenceSync";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_30%),linear-gradient(135deg,_#05070d_0%,_#0a0f1d_45%,_#05070d_100%)] text-zinc-100 antialiased">
      <MarketIntelligenceSync />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6 xl:p-8">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <TopBar />
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
