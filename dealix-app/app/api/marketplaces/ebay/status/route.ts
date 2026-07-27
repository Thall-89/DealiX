import { NextRequest, NextResponse } from "next/server";
import { ebayAdapter } from "@/lib/marketplaces";
import { assertSameOrigin, requireUser } from "@/lib/security/request";
export const runtime = "nodejs";
export async function GET(request: NextRequest) { try { assertSameOrigin(request); await requireUser(request); const status = ebayAdapter.status(); return NextResponse.json({ status: status.configured ? `${status.environment === "production" ? "Production" : "Sandbox"} Configured` : "Not Configured", configured: status.configured }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { if (error instanceof Response) return error; return NextResponse.json({ error: "Unable to check eBay status." }, { status: 500 }); } }
