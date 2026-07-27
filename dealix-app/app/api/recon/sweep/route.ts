import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { runReconSweep } from "@/lib/recon/sweep";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || secret.length < 32 || supplied.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(secret));
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try { return NextResponse.json(await runReconSweep(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Recon sweep failed." }, { status: 500, headers: { "Cache-Control": "no-store" } }); }
}
