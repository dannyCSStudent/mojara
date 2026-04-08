# Ticket 2.3: Move Notification Read State and Preferences Fully Behind API

## Title
Move notification read state and preferences fully behind API

## Description
Consolidate notification operations under backend-owned endpoints. Ensure unread count, mark-read behavior, and preference management all use explicit API contracts rather than ad hoc client-side DB coupling.

## Affected backend files
- `apps/backend-fastapi/app/routes/notifications.py`
- `apps/backend-fastapi/app/repositories/notifications.py`

## Affected frontend files
- `apps/frontend-mobile/app/(private)/notifications.tsx`
- `apps/frontend-mobile/api/notifications.ts`
- `apps/frontend-mobile/store/useAppStore.ts`

## Database changes
- Optional: add a notification preferences table or extend subscription schema

## API endpoints
- Existing notification endpoints
- Optional `PATCH /notifications/read-all`
- Optional `GET /notifications/preferences`
- Optional `PATCH /notifications/preferences`

## Acceptance criteria
- Notification reads/writes are performed through backend endpoints only.
- Unread counts remain consistent with read state.
- Preference configuration is explicit and persisted if added.

## Test requirements
- Backend tests for list, mark-read, unread-count, and preferences if implemented.
- Frontend screen tests for load, error, mark-read, and empty states.
