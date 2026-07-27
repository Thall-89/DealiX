import { NextRequest, NextResponse } from "next/server";
import { discordStatus, sendDiscordTestAlert } from "@/lib/notifications/discord";
import { assertSameOrigin, requireUser } from "@/lib/security/request";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { logSecurityEvent, recordSecurityEvent } from "@/lib/security/audit";
export const runtime = "nodejs";
export async function GET(request: NextRequest) { try { assertSameOrigin(request); await requireUser(request); return NextResponse.json(discordStatus(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { if (error instanceof Response) return error; return NextResponse.json({ error: "Unable to check Discord status." }, { status: 500 }); } }
export async function POST(request: NextRequest) { try { assertSameOrigin(request); const user = await requireUser(request); await enforceRateLimit("discord-test", user.id, 3, 300_000); await sendDiscordTestAlert(); await recordSecurityEvent(user.id, "Discord test alert sent"); return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { if (error instanceof Response) { if (error.status === 401 || error.status === 403 || error.status === 429) logSecurityEvent("discord_request_denied", { status: error.status }); return error; } return NextResponse.json({ error: "Discord test alert failed." }, { status: 502 }); } }
