'use client';

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { ComponentSpecs } from "@/lib/componentCatalog";

export type BuildLabSlot = "CPU" | "CPU Cooler" | "Motherboard" | "RAM" | "GPU" | "Storage" | "Case" | "PSU" | "Operating System" | "Accessories";
export type BuildLabSelection = { id: string; name: string; source: "Inventory" | "Recon" | "Catalog"; cost?: number; value?: number; note: string; specs?: ComponentSpecs };
type DraftContext = { selected: Partial<Record<BuildLabSlot, BuildLabSelection>>; setSelected: Dispatch<SetStateAction<Partial<Record<BuildLabSlot, BuildLabSelection>>>> };
const Context = createContext<DraftContext | null>(null);

export function BuildLabDraftProvider({ children }: { children: ReactNode }) { const [selected, setSelected] = useState<Partial<Record<BuildLabSlot, BuildLabSelection>>>({}); const value = useMemo(() => ({ selected, setSelected }), [selected]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useBuildLabDraft() { const value = useContext(Context); if (!value) throw new Error("Build Lab draft is unavailable."); return value; }
