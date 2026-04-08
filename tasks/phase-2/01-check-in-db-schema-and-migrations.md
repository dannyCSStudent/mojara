# Ticket 2.1: Document and Check In Database Schema/Migrations

## Title
Document and check in database schema and migrations

## Description
Bring the Supabase/Postgres schema into the repository so backend behavior is reproducible. Version control the tables, RPCs, indexes, triggers, and worker-related objects that the backend and notification worker depend on.

## Affected backend files
- New migrations directory under repo root or `apps/backend-fastapi/`
- Setup docs in `README.md`
- Optional backend docs/config for migration tooling

## Affected frontend files
- None

## Database changes
- Add versioned migrations for core tables
- Add migrations for RPCs used by orders/prices/dashboard
- Add indexes and triggers required for notifications and performance

## API endpoints
- None directly

## Acceptance criteria
- A fresh environment can recreate all DB objects required by the backend and worker.
- Migrations are versioned and documented.
- Required RPCs and worker tables are defined in-repo.
- Setup documentation explains how to apply migrations locally.

## Test requirements
- Migration smoke test against a local or disposable DB.
- Verification test asserting required tables/RPCs exist after migration.
