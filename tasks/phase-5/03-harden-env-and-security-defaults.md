# Ticket 5.3: Harden Environment Configuration and Security Defaults

## Title
Harden environment configuration and security defaults

## Description
Replace dev-only defaults with environment-aware configuration for CORS, API URLs, and secrets handling. Reduce reliance on hardcoded localhost and static Expo config values.

## Affected backend files
- `apps/backend-fastapi/main.py`
- `apps/backend-fastapi/app/config.py`

## Affected frontend files
- `apps/frontend-mobile/config/env.ts`
- `apps/frontend-mobile/app.json`

## Database changes
None.

## API endpoints
None.

## Acceptance criteria
- CORS is environment-specific.
- Frontend config supports local/dev/prod-like environments cleanly.
- Secrets are loaded from proper env sources rather than hardcoded values.
- Local development still works with documented setup.

## Test requirements
- Config parsing/unit tests where practical.
- Manual verification across at least local and one non-local environment config.
