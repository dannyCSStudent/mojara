# Ticket 5.2: Add Observability for API and Worker

## Title
Add observability for API and worker

## Description
Add structured logging, request/error instrumentation, and clearer health/metrics surfaces for the FastAPI backend and notification worker.

## Affected backend files
- `apps/backend-fastapi/main.py`
- New logging/middleware files as needed
- Worker logging/metrics modules in `apps/worker-notifications/`

## Affected frontend files
- Optional client telemetry hooks if included

## Database changes
None.

## API endpoints
- Existing `GET /health`
- Optional readiness or metrics endpoints

## Acceptance criteria
- Backend emits structured request and error logs.
- Worker metrics are documented and exposed consistently.
- Health endpoints reflect useful service readiness, not just process liveness.

## Test requirements
- Smoke tests for health/readiness endpoints.
- Middleware/logging tests where practical.
