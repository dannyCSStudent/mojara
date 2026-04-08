# Ticket 1.3: Mount and Secure User Administration Routes

## Title
Mount and secure user administration routes

## Description
Wire the existing role-management route into the FastAPI app and protect it with valid admin permissions. Ensure the route rejects invalid roles and only trusted admins can update user roles in Supabase auth metadata.

## Affected backend files
- `apps/backend-fastapi/main.py`
- `apps/backend-fastapi/app/routes/users.py`
- `apps/backend-fastapi/app/services/user_admin.py`
- `apps/backend-fastapi/app/core/permissions.py`

## Affected frontend files
- None required for the backend-only slice

## Database changes
- No schema changes
- Supabase auth `app_metadata` role updates only

## API endpoints
- `PATCH /users/{user_id}/role`

## Acceptance criteria
- The users router is mounted in FastAPI.
- Only admins can change user roles.
- Invalid roles are rejected with a client error.
- Successful requests update the user role in Supabase auth metadata.

## Test requirements
- Authorization test for admin-only access.
- Validation test for supported role values.
- Service test or mocked integration test for the Supabase admin update call.
