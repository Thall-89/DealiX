import type { ReactNode } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MarketIntelligenceSync } from "@/components/MarketIntelligenceSync";
import { AuthIdentityProvider, type AuthIdentity } from "@/components/AuthIdentity";
import { ThemeProvider } from "@/components/ThemeProvider";

interface AppShellProps {
  children: ReactNode;
  identity: AuthIdentity;
}

export function AppShell({ children, identity }: AppShellProps) {
  return (
    <AuthIdentityProvider identity={identity}><ThemeProvider><div className="app-shell min-h-screen text-zinc-100 antialiased">
      <MarketIntelligenceSync />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6 xl:p-8">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <TopBar />
          {children}
        </main>
      </div>
      <CommandPalette />
    </div></ThemeProvider></AuthIdentityProvider>
  );
}
