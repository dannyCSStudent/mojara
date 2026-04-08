# Supabase Schema Baseline

This directory is the checked-in baseline for the database objects the app currently depends on.

Important:
- This is an inferred first-pass schema based on the application code in this repository.
- It is intended to make the dependency surface explicit and reproducible.
- It should be reconciled against the live Supabase project before promotion to production.

Contents:
- `schema-inventory.md`: human-readable inventory of required tables, views, functions, and channels.
- `migrations/`: SQL migrations for the inferred baseline.

Current status:
- Core marketplace tables are defined.
- Order and notification RPCs used by the backend are defined.
- Pricing views used by the backend are defined.
- The `price_event_channel` trigger used by the notification worker is defined.
- Row-level security policies are not fully modeled yet and must be reconciled with the live project.

Recommended next steps:
1. Apply the baseline to a disposable Supabase/Postgres instance.
2. Compare the live schema to the checked-in baseline.
3. Add follow-up migrations for RLS policies, grants, and production-only indexes.
