# Ticket 3.3: Build Admin User and Vendor Management Screens

## Title
Build admin user and vendor management screens

## Description
Expose user role management and vendor oversight inside the mobile app. This ticket depends on the backend role-management route being mounted and secured first.

## Affected backend files
- `apps/backend-fastapi/app/routes/users.py`
- Vendor list/detail routes and repositories as needed

## Affected frontend files
- New screens under `apps/frontend-mobile/app/(private)/(admin)/`
- `apps/frontend-mobile/components/dashboard/AdminQuickActions.tsx`
- Shared admin API client files as needed

## Database changes
None expected.

## API endpoints
- `PATCH /users/{user_id}/role`
- Vendor list/detail endpoints as needed for admin oversight

## Acceptance criteria
- Admin users can open a protected management area.
- Admin can list users/vendors and change supported user roles.
- Non-admins are redirected or denied.
- UI shows success and failure feedback for mutations.

## Test requirements
- Frontend screen tests for protected access and mutation flows.
- Backend authorization tests for admin-only APIs used by the screen.
