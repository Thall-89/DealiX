'use client';

import { BuildLabDraftProvider } from "@/components/BuildLabDraft";

export default function PlannerLayout({ children }: { children: React.ReactNode }) { return <BuildLabDraftProvider>{children}</BuildLabDraftProvider>; }
