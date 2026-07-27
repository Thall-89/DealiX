import { NextRequest } from "next/server";
import { handleMarketplaceSearch } from "@/lib/marketplaces/searchRoute";
export const runtime = "nodejs";
export async function POST(request: NextRequest) { return handleMarketplaceSearch(request, "ebay"); }
