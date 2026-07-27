# DealiX hosted deal monitor

This Worker runs every five minutes. Market Intelligence records can now be persisted in Supabase, but the worker deliberately does no work until a deployed repository-monitor endpoint is configured. Browser localStorage cannot support background monitoring because it does not exist when a user closes DealiX.

Configure `SEARCH_REPOSITORY_URL` and a 32+ character `CRON_SECRET` as Worker secrets. Do not put eBay, Discord, or Supabase service credentials in source control. The repository endpoint must enforce a run lock, cooldown, query deduplication, rate limits, per-search error isolation, and notification de-duplication.

The worker validates that its target is a public HTTPS URL before sending the signed request. This prevents a scheduler secret from being used to probe local or private network addresses.
