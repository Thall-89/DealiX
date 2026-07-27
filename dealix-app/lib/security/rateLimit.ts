import "server-only";

type Counter = { count: number; resetAt: number };
const localCounters = new Map<string, Counter>();
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function unavailable(): never { throw new Response("Rate limiting is unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } }); }

async function distributedLimit(key: string, limit: number, windowMs: number) {
  const script = "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return {count,redis.call('PTTL',KEYS[1])}";
  const response = await fetch(redisUrl as string, { method: "POST", headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" }, body: JSON.stringify(["EVAL", script, 1, key, windowMs]), cache: "no-store", signal: AbortSignal.timeout(2_000) });
  if (!response.ok) throw new Error("Upstash request failed");
  const payload = await response.json() as { result?: [number, number] };
  const [count, ttl] = payload.result ?? [];
  if (typeof count !== "number" || typeof ttl !== "number" || !Number.isFinite(count) || !Number.isFinite(ttl)) throw new Error("Invalid Upstash response");
  return { allowed: count <= limit, retryAfter: Math.max(1, Math.ceil(ttl / 1_000)) };
}

function developmentLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now(); const entry = localCounters.get(key);
  if (!entry || entry.resetAt <= now) { localCounters.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfter: Math.ceil(windowMs / 1_000) }; }
  entry.count += 1;
  return { allowed: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)) };
}

export async function enforceRateLimit(scope: string, subject: string, limit: number, windowMs: number) {
  const key = `dealix:rate:${scope}:${subject}`;
  let result: { allowed: boolean; retryAfter: number };
  try {
    result = redisUrl && redisToken ? await distributedLimit(key, limit, windowMs) : process.env.NODE_ENV === "production" ? unavailable() : developmentLimit(key, limit, windowMs);
  } catch {
    if (process.env.NODE_ENV === "production") unavailable();
    result = developmentLimit(key, limit, windowMs);
  }
  if (!result.allowed) throw new Response("Too many requests. Try again shortly.", { status: 429, headers: { "Retry-After": String(result.retryAfter), "Cache-Control": "no-store" } });
}
