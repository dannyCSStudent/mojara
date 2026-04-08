# Ticket 1.4: Replace Mock Admin Dashboard Overview with Real Data

## Title
Replace mock admin dashboard overview with real data

## Description
The current admin overview endpoint returns hardcoded values. Implement real dashboard aggregation logic in the repository layer and expose the live metrics to the admin dashboard screen.

## Affected backend files
- `apps/backend-fastapi/app/routes/dashboard.py`
- `apps/backend-fastapi/app/repositories/dashboard.py`
- `apps/backend-fastapi/app/schemas/dashboard.py`

## Affected frontend files
- `apps/frontend-mobile/api/dashboard.ts`
- `apps/frontend-mobile/hooks/useDashboard.ts`
- `apps/frontend-mobile/app/(private)/(admin)/dashboard.tsx`

## Database changes
- None required if current tables are sufficient
- Optional: add a DB view or RPC if aggregation is easier to maintain that way

## API endpoints
- `GET /dashboard/admin/overview`

## Acceptance criteria
- Endpoint returns live data for total orders in the last 7 days, orders today, active vendors, active price agreements, and pending orders.
- Non-admin users are denied access.
- The admin dashboard consumes the live endpoint without hardcoded fallback values.

## Test requirements
- Backend aggregation tests using seeded data.
- Route test for admin access and non-admin denial.
- Frontend hook test for success and error handling.
