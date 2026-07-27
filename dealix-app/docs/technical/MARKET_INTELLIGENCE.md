# DealiX Recon

## What is live today

DealiX Recon uses a provider registry and a normalized listing contract. eBay is the only enabled live provider, and it uses eBay's official Browse API through a server-only route. Jawa, Craigslist, and Facebook Marketplace remain disabled until an approved official integration is available; DealiX does not scrape them.

The app evaluates a listing with explainable recorded inputs: landed cost, potential resale value when entered, estimated profit, ROI, risk, confidence, compatibility, and a recommendation. It does not invent specifications or financial values.

## Persistence

Run `20260729_market_intelligence_persistence.sql` after the earlier Supabase migrations. It adds stable client keys to the existing, user-isolated Market Intelligence tables.

The authenticated snapshot API now persists these collections in their dedicated tables:

- Saved searches
- Marketplace opportunities
- Watchlist entries
- Market alerts and notification records
- Alert fingerprints
- Market alert preferences

The browser hydrates this data for signed-in users and saves changes after a short debounce. The API takes the user identity only from the verified Supabase session; it never accepts a user ID from the browser. Each input collection is size-bounded and Zod-validated before it is stored.

Builds, inventory, sales, and the rest of the business workspace retain their existing `app_settings.data` migration path until their own normalized repositories are introduced.

## Background scanning

The worker schedule is set to every five minutes. Configure its `SEARCH_REPOSITORY_URL` as `https://your-domain.com/api/recon/sweep` and provide the same 32+ character `CRON_SECRET` to both the Worker and server. The protected endpoint uses a per-user database lock, runs active eBay profiles, normalizes and deduplicates targets, persists sweep results, records a monitor run, and creates one in-app notification for genuinely new high-value targets.

Because a search result is not proof that a previously returned listing sold, Recon does not falsely expire listings just because they do not appear in a later search page. Expiry requires a provider listing-status capability.
