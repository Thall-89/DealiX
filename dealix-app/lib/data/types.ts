import type { DealiXData } from "@/lib/store";
export type DataMode = "local" | "supabase";
export interface DataRepository { mode: DataMode; configured: boolean; load(): Promise<DealiXData | null>; save(snapshot: DealiXData): Promise<void>; exportData(): Promise<DealiXData | null>; }
export interface MigrationPreview { recordCounts: Record<string, number>; warnings: string[]; }
