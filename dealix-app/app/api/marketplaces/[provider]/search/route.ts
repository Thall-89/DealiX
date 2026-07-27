import { NextRequest } from "next/server";
import { handleMarketplaceSearch } from "@/lib/marketplaces/searchRoute";
export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) { const { provider } = await context.params; return handleMarketplaceSearch(request, provider); }
