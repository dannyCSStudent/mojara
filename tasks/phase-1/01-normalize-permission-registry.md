# Ticket 1.1: Normalize Permission Registry Across Backend and Shared Packages

## Title
Normalize permission registry across backend and shared packages

## Description
Make permissions a single source of truth across FastAPI and shared TypeScript packages. Add missing permissions currently referenced by routes, remove dead entries where appropriate, and align role mappings between backend and client route guards.

Current drift includes backend routes using permissions that are not declared in shared types or shared role maps, including `products.create`, `products.delete`, `products.bulk_create`, `notifications.delete`, `orders.refund`, `users.read`, and `users.write`.

## Affected backend files
- `apps/backend-fastapi/app/core/permissions.py`
- `apps/backend-fastapi/app/routes/markets.py`
- `apps/backend-fastapi/app/routes/orders.py`
- `apps/backend-fastapi/app/routes/notifications.py`
- `apps/backend-fastapi/app/routes/admin.py`
- `apps/backend-fastapi/app/routes/dashboard.py`

## Affected frontend files
- `packages/types/src/permissions.ts`
- `packages/permissions/src/roles.ts`
- `packages/permissions/src/routes.ts`
- `apps/frontend-mobile/app/(private)/(admin)/_layout.tsx`

## Database changes
None.

## API endpoints
- All permission-protected endpoints affected by shared permission names.

## Acceptance criteria
- Every permission string required by backend routes exists in backend and shared TS permission registries.
- Role definitions are aligned between backend and frontend shared packages.
- Client route guards reference valid permission strings only.
- No route depends on an undefined permission.
- Dead permissions are either removed or documented as reserved.

## Test requirements
- Add backend unit tests for permission matching behavior.
- Add shared package tests for `hasPermission`.
- Add a contract test that enumerates route permission dependencies and verifies they exist in the shared registry.
