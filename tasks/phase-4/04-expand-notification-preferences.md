# Ticket 4.4: Expand Notification Preferences and Digest Options

## Title
Expand notification preferences and digest options

## Description
Move beyond simple subscriptions into richer notification controls such as event type selection, severity thresholds, and digest behavior. The worker must respect the updated preference model.

## Affected backend files
- `apps/backend-fastapi/app/routes/notifications.py`
- `apps/backend-fastapi/app/repositories/notifications.py`
- `apps/worker-notifications/subscriptions.py`

## Affected frontend files
- `apps/frontend-mobile/app/(private)/notifications.tsx`
- New notification settings UI and supporting API files

## Database changes
- Extend notification preference/subscription schema to capture richer settings

## API endpoints
- Existing notification preference endpoints
- Additional digest-related endpoints if needed

## Acceptance criteria
- Users can configure preference granularity in the UI.
- Backend persists the new preference model.
- Worker matching logic respects configured thresholds and delivery rules.
- Existing notification delivery still works after migration.

## Test requirements
- Worker tests for subscription matching and preference filtering.
- Backend tests for preference persistence.
- Frontend settings tests.
