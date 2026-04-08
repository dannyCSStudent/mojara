# Ticket 1.5: Add Missing Admin Orders Trend Endpoint

## Title
Add missing admin orders trend endpoint

## Description
The frontend API client already expects an admin orders trend endpoint, but the backend does not implement it. Add the endpoint and return daily order counts in the shape expected by shared types.

## Affected backend files
- `apps/backend-fastapi/app/routes/dashboard.py`
- `apps/backend-fastapi/app/repositories/dashboard.py`
- `apps/backend-fastapi/app/schemas/dashboard.py`

## Affected frontend files
- `apps/frontend-mobile/api/dashboard.ts`
- Admin dashboard chart components, if implemented in the same slice

## Database changes
- None required
- Optional: add a DB view or RPC for daily order aggregation

## API endpoints
- `GET /dashboard/admin/orders-trend`

## Acceptance criteria
- Endpoint exists and returns `OrdersTrendPoint[]`.
- Data is grouped by day for a defined reporting window.
- Response shape matches `@repo/types`.
- Admin-only authorization is enforced.

## Test requirements
- Backend tests for grouping and response shape.
- Authorization tests for admin access.
- Frontend API contract test or hook test if consumed immediately.
