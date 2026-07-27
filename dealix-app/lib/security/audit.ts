import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const sensitiveKey = /(password|secret|token|authorization|cookie|api[_-]?key|session)/i;

function redactContext(context: Record<string, string | number | boolean>) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, sensitiveKey.test(key) ? "[redacted]" : value]));
}

export function logSecurityEvent(action: string, context: Record<string, string | number | boolean> = {}) {
  console.warn(JSON.stringify({ category: "security", action, occurredAt: new Date().toISOString(), ...redactContext(context) }));
}

export async function recordSecurityEvent(userId: string, action: string, context: Record<string, string | number | boolean> = {}) {
  const safeContext = redactContext(context);
  logSecurityEvent(action, safeContext);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const { error } = await createSupabaseAdminClient().from("audit_events").insert({ user_id: userId, action, related_type: "security", event_source: "server", new_value: safeContext });
    if (error) logSecurityEvent("audit_write_failed", { action });
  } catch { logSecurityEvent("audit_write_failed", { action }); }
}
