import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { assertSameOrigin, requireUser } from "@/lib/security/request";

const schema = z.object({ event: z.enum(["sign_in", "sign_out"]) }).strict();
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    await enforceRateLimit("auth-event", user.id, 10, 300_000);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid audit event." }, { status: 400 });
    await recordSecurityEvent(user.id, parsed.data.event === "sign_in" ? "User signed in" : "User signed out");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { if (error instanceof Response) return error; return NextResponse.json({ error: "Authentication event could not be recorded." }, { status: 500 }); }
}
