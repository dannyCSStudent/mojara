# Ticket 1.2: Fix Broken Orders Summary Auth Contract

## Title
Fix broken orders summary auth contract

## Description
Repair `GET /orders/summary` so it uses the JWT field actually returned by auth dependencies and returns correct summaries for both user and vendor scopes. The current route reads `current_user["jwt"]`, while the auth dependency attaches `_jwt`.

## Affected backend files
- `apps/backend-fastapi/app/routes/orders.py`
- `apps/backend-fastapi/app/core/dependencies.py`
- `apps/backend-fastapi/app/repositories/orders.py`

## Affected frontend files
- `apps/frontend-mobile/api/orders.ts`
- Any frontend screen or hook consuming orders summary data

## Database changes
None expected unless the underlying `orders_summary_by_scope` RPC needs correction.

## API endpoints
- `GET /orders/summary`

## Acceptance criteria
- `GET /orders/summary?scope=user` returns valid data for authenticated users.
- `GET /orders/summary?scope=vendor` returns valid data for vendors.
- Non-vendors requesting `scope=vendor` receive a zeroed summary, not an error.
- No runtime auth payload key errors occur.

## Test requirements
- Backend route tests for `scope=user` and `scope=vendor`.
- Negative test for unauthenticated access.
- Repository or integration test for expected summary shape.
