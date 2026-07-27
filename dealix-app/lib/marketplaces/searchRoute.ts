import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMarketplaceProvider } from "@/lib/marketplaces";
import { logSecurityEvent, recordSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { assertSameOrigin, requireUser } from "@/lib/security/request";

const requestSchema = z.object({ queries: z.array(z.string().trim().min(2).max(100).regex(/^[\p{L}\p{N}\s+\-./()]+$/u)).min(1).max(10), maxPrice: z.number().finite().min(0).max(100_000).optional(), condition: z.enum(["Any", "New", "Open Box", "Used", "For Parts / Not Working", "Unknown"]).optional(), category: z.string().trim().min(1).max(80).optional(), limit: z.number().int().min(1).max(50).optional(), cursor: z.string().trim().min(1).max(500).optional() }).strict();

export async function handleMarketplaceSearch(request: NextRequest, providerId: string) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    await enforceRateLimit(`marketplace:${providerId}`, user.id, 12, 60_000);
    if (Number(request.headers.get("content-length") ?? 0) > 4_096) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    const provider = getMarketplaceProvider(providerId);
    if (!provider) return NextResponse.json({ error: "Unknown marketplace provider." }, { status: 404 });
    const status = provider.status();
    if (!provider.definition.liveSearch || !status.configured) return NextResponse.json({ error: status.reason ?? `${provider.definition.label} is not configured.` }, { status: 503 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid search request." }, { status: 400 });
    const page = await provider.search(parsed.data);
    await recordSecurityEvent(user.id, "Marketplace search", { provider: provider.definition.id, queryCount: parsed.data.queries.length, resultCount: page.listings.length });
    return NextResponse.json({ provider: provider.definition, listings: page.listings, nextCursor: page.nextCursor }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) { if (error.status === 401 || error.status === 403 || error.status === 429) logSecurityEvent("marketplace_request_denied", { provider: providerId, status: error.status }); return error; }
    const message = error instanceof Error && error.message.includes("rate limit") ? "Marketplace rate limit reached. Try again later." : "Marketplace search failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
