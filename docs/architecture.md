# Architecture

## System shape

Mojara is a pnpm/Turborepo monorepo with three application runtimes and shared TypeScript packages:

- `apps/frontend-mobile`: Expo / React Native client
- `apps/backend-fastapi`: FastAPI backend
- `apps/worker-notifications`: async Python worker for notification event processing
- `packages/ui`: shared UI components
- `packages/types`: shared TypeScript types
- `packages/permissions`: shared permission helpers

## Runtime responsibilities

### Frontend

The mobile app is responsible for:
- Supabase auth session lifecycle
- local UI state and persisted app preferences
- calling backend APIs for marketplace domain data
- rendering screens, polling, and user actions

The frontend should not read or write marketplace domain tables directly.

### Backend

The FastAPI app is the domain boundary for:
- markets
- market subscriptions
- vendors
- products
- orders
- prices
- notifications
- dashboard/admin queries

The backend validates auth, applies role/permission checks, and reads/writes Supabase-backed data through repository modules.

### Worker

The notification worker is responsible for:
- consuming `price_events`
- matching subscriptions
- creating notification rows
- retry / dead-letter handling
- exposing worker metrics

## Data boundary

### Current rule

Marketplace domain data is backend-owned.

That means the mobile app should use backend endpoints for:
- orders
- market subscriptions
- notifications
- prices
- dashboard/admin data

### Intentional Supabase usage in the frontend

Direct Supabase usage remains only for infrastructure concerns:
- auth/session management
- password recovery / reset flows

This is intentional. It should not expand into direct domain-table access again without an explicit architecture decision.

## Database dependency model

The system uses Supabase Postgres as the persistence layer.

Repo-owned database artifacts now live under:
- `supabase/schema-inventory.md`
- `supabase/migrations/`

These files are the checked-in baseline for tables, views, RPCs, and triggers the code depends on. They still need reconciliation with the live Supabase project, especially around RLS policies and grants.

## Order flow

1. The frontend creates or reads orders through backend APIs.
2. The backend delegates transactional work to Postgres RPCs such as:
   - `create_order_atomic`
   - `confirm_order_atomic`
   - `cancel_order_atomic`
   - `refund_order_atomic`
3. The backend normalizes DB responses into API contracts for the client.

Admin order reads now also go through backend APIs instead of direct client-side Supabase reads.

## Notification flow

1. Pricing changes create `price_events`.
2. A DB trigger publishes to `price_event_channel`.
3. `worker-notifications` listens for events and processes backlog on startup.
4. Matching subscriptions produce rows in `notifications`.
5. The mobile app reads notifications and unread counts through backend APIs.

The notification badge is currently API-polled rather than using direct client-side DB subscriptions.

## Admin user management contract

The admin users surface is backed by backend-owned normalization and filtering rules.

Current backend guarantees for `GET /users` and `GET /users/{user_id}`:
- Supabase auth admin responses are normalized into a stable API shape with:
  - `id`
  - `email`
  - `role`
  - `vendor_id`
  - `created_at`
  - `last_sign_in_at`
- Missing `app_metadata` defaults to:
  - `role = "user"`
  - `vendor_id = null`
- `GET /users` supports:
  - free-text `search`
  - exact `role`
  - exact `vendor_id`
  - explicit `sort_field`
  - explicit `sort_direction`
  - paginated metadata via `page`, `per_page`, and `has_more`
- Sorting behavior is intentional:
  - string sort is case-insensitive
  - `None` values sort last for ascending order
  - `None` values sort first for descending order

The frontend admin navigation now assumes those guarantees. If the backend user contract changes, both the backend unit tests and the frontend admin navigation/state helper tests should be updated together.

## Frontend admin user/vendor navigation contract

The frontend admin user/vendor flow now relies on shared helper-owned route and view-state rules.

Current frontend guarantees:
- Admin route construction lives in `apps/frontend-mobile/utils/adminNavigation.ts`.
- Shared admin route helpers currently cover:
  - the admin users list
  - vendor-scoped related-users mode
  - admin user detail
  - admin vendor product management
- Vendor-scoped users mode is exact-filtered by `vendorId`, not fuzzy search text.
- Vendor-scoped users banner/empty-state copy lives in `apps/frontend-mobile/utils/adminUsersViewState.ts`.
- The vendor-scoped users banner intentionally shows:
  - exact vendor context
  - linked-user count for the current page
  - whether more pages are available
- The vendor-scoped users empty state intentionally distinguishes:
  - no linked users for a selected vendor
  - generic unfiltered search empty states

These frontend helper contracts are covered by the lightweight frontend test suite. If admin navigation routes or vendor-scoped users copy change, the helper tests should be updated together with the screen code.

## Realtime strategy

The current frontend strategy is backend-owned polling for domain data.

This is deliberate:
- it reduces client coupling to table structure and RLS details
- it keeps permissions and shape normalization in one place
- it avoids mixed direct-DB/API access patterns for the same domain

If realtime is reintroduced for domain data later, it should be done through an explicit documented contract, not ad hoc table subscriptions in the client.

## Quality gates

Repo-level validation currently includes:
- `pnpm check-types`
- `pnpm test`

Backend tests run through the local backend virtualenv, and the worker has smoke coverage. This is a baseline, not full production-grade coverage.

## Known gaps

- Live Supabase schema and repo baseline still need reconciliation.
- RLS/grants are not yet fully checked in.
- Order state-machine rules are only partially hardened; deeper DB-level validation is still needed.
- Observability and CI are present as backlog items, not fully complete production systems.
