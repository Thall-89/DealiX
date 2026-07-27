import { NextRequest, NextResponse } from "next/server";
import { loadMarketIntelligence, saveMarketIntelligence } from "@/lib/marketIntelligence/snapshot";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { assertSameOrigin, requireUser } from "@/lib/security/request";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await enforceRateLimit("market-intelligence-read", user.id, 60, 60_000);
    const snapshot = await loadMarketIntelligence(user.id);
    return NextResponse.json({ snapshot }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Could not load Market Intelligence." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    await enforceRateLimit("market-intelligence-write", user.id, 30, 60_000);
    if (Number(request.headers.get("content-length") ?? 0) > 2_000_000) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    await saveMarketIntelligence(user.id, await request.json());
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Could not save Market Intelligence." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
