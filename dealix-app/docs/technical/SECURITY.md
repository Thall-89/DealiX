# Security controls

Cloud mode uses Supabase SSR cookie sessions. `proxy.ts` refreshes those sessions and redirects unauthenticated browser requests to `/login`; the protected server layout repeats the verification before rendering app content. Local demo mode intentionally bypasses this only when no Supabase public configuration exists.

Configured eBay and Discord endpoints require a valid user token, same-origin requests, strict Zod validation, no-store responses, ownership-scoped RLS, and per-user limits. In production, limits require `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; the endpoints fail closed if the distributed limiter is unavailable. Local development uses an isolated in-memory fallback.

Run Supabase migrations in order through `20260728_audit_log_hardening.sql`. Storage buckets are private, restricted to `users/{user_id}/...`, limited to 10 MB, and accept only the configured image/PDF MIME types. Audit-event rows are read-only to browser users; database triggers record cloud snapshot changes, and server code records successful sign-ins, sign-outs, and integration events without credentials, tokens, passwords, or raw marketplace payloads.

Never place `SUPABASE_SERVICE_ROLE_KEY`, eBay credentials, Discord webhooks, Redis tokens, or `CRON_SECRET` in client code, browser storage, or Git. Service-role access is limited to server-only modules. Security headers are supplied by `next.config.ts`: CSP, HSTS, clickjacking protection, no-sniff, referrer restrictions, and a restrictive Permissions Policy.
