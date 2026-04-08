# Ticket 2.4: Decide and Enforce Realtime Strategy

## Title
Standardize realtime strategy across app domains

## Description
Document and enforce a consistent approach for realtime events. Decide per domain whether updates come directly from Supabase subscriptions or through backend-owned event contracts, then refactor duplicates and implicit patterns.

## Affected backend files
- Backend docs/config related to realtime strategy
- Optional event endpoints or middleware if backend-mediated delivery is chosen

## Affected frontend files
- `apps/frontend-mobile/hooks/useOrdersRealtime.ts`
- `apps/frontend-mobile/hooks/useOrdersAdminRealtime.ts`
- `apps/frontend-mobile/hooks/usePriceBoard.ts`
- `apps/frontend-mobile/store/useAppStore.ts`

## Database changes
- Possible RLS/publication adjustments
- Optional event tables or channels depending on chosen design

## API endpoints
- None required by default
- Add event endpoints only if backend mediation is selected

## Acceptance criteria
- Each realtime use case has a documented source of truth.
- Duplicate polling/realtime patterns are removed or justified.
- Auth and RLS assumptions are explicit.
- Subscription cleanup and dedupe behavior are consistent.

## Test requirements
- Integration or manual verification plan for each realtime domain.
- Regression tests for dedupe or event replay behavior where applicable.
