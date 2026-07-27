# Database Notes

No database is connected yet. The current version uses local browser storage and mock data only.

## Current storage model

- Browser local storage for edited build data
- In-memory or static mock data for builds, inventory, tasks, and notifications

## Future plan

- Replace local storage with a database later if approved.
- Add proper tables for builds, inventory, tasks, and marketplace events.
# Supabase cloud mode

Run the migrations in filename order: `20260725_initial.sql`, `20260726_complete_schema.sql`, `20260727_security_hardening.sql`, `20260728_audit_log_hardening.sql`, `20260729_market_intelligence_persistence.sql`, `20260730_recon_scan_lock.sql`, then `20260731_recon_market_memory.sql`. Every user-owned table has `user_id` and Row Level Security so accounts can only access their own rows. The repository retains its backwards-compatible cloud snapshot in `app_settings.data`; Market Intelligence now also persists its own user-isolated records in the dedicated tables. Local demo data remains separate and is never deleted by migration.

The second migration creates the private receipt and image buckets and their policies. Use user-specific `users/{user_id}/{category}/{record_id}/{filename}` paths and signed URLs; never make receipt or sales buckets public.
