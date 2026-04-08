# Ticket 3.4: Expand Price Agreement Administration

## Title
Expand price agreement administration workflow

## Description
Turn the pricing subsystem into a fuller admin workflow with filtering, explainability, and clearer lifecycle controls for price agreements and signals.

## Affected backend files
- `apps/backend-fastapi/app/routes/prices.py`
- `apps/backend-fastapi/app/routes/admin_prices.py`
- `apps/backend-fastapi/app/repositories/prices.py`

## Affected frontend files
- `apps/frontend-mobile/api/prices.ts`
- `apps/frontend-mobile/api/adminPrices.ts`
- `apps/frontend-mobile/app/(private)/(admin)/prices.tsx`

## Database changes
- Optional indexes or views on price signal and agreement data

## API endpoints
- Existing prices endpoints
- Additional filter/detail endpoints if needed

## Acceptance criteria
- Admin can list and filter price agreements.
- Admin can inspect explanation data for a market or agreement.
- Locking behavior works reliably with proper permissions.
- Existing user/vendor price board behavior remains compatible.

## Test requirements
- Backend tests for filters, lock behavior, and explain responses.
- Frontend tests for admin list/actions and error handling.
