# Ticket 2.2: Move Market Subscription Writes Behind Backend API

## Title
Move market subscription writes behind backend API

## Description
The mobile app currently reads and writes `market_subscriptions` directly through Supabase. Replace that with backend-managed endpoints so auth, validation, and future auditing live on one server-side boundary.

## Affected backend files
- New route/repository for market subscriptions, or extend an existing user/preferences area
- `apps/backend-fastapi/app/core/permissions.py`

## Affected frontend files
- `apps/frontend-mobile/store/useAppStore.ts`
- `apps/frontend-mobile/app/(private)/markets/manage.tsx`
- New `apps/frontend-mobile/api/marketSubscriptions.ts` if added

## Database changes
- None initially
- Optional: add uniqueness constraints or audit fields if missing

## API endpoints
- `GET /me/market-subscriptions`
- `POST /me/market-subscriptions`
- `DELETE /me/market-subscriptions/{market_id}`

## Acceptance criteria
- The client no longer inserts/deletes rows in `market_subscriptions` directly.
- Backend enforces current-user ownership.
- Existing active-market selection behavior continues to work.
- Error handling supports optimistic UI rollback.

## Test requirements
- Backend CRUD tests for authenticated ownership.
- Frontend store tests for optimistic update success and failure cases.
