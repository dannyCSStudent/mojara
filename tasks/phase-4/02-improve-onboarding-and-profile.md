# Ticket 4.2: Improve Onboarding and Profile Completion Flow

## Title
Improve onboarding and profile completion flow

## Description
Make onboarding and profile flows explicit, resumable, and tied to role-specific app behavior. New users should land in a valid state with appropriate market subscriptions and profile completeness.

## Affected backend files
- Optional profile/preferences endpoints if implemented server-side

## Affected frontend files
- `apps/frontend-mobile/app/(private)/onboarding.tsx`
- `apps/frontend-mobile/app/(private)/profile.tsx`
- `apps/frontend-mobile/store/useAppStore.ts`

## Database changes
- Optional new profile fields or onboarding completion flags

## API endpoints
- Optional profile endpoints if backend-owned

## Acceptance criteria
- New users can complete onboarding without dead ends.
- Onboarding progress is resumable if interrupted.
- Profile changes persist correctly.
- Role-specific onboarding behavior is supported if needed.

## Test requirements
- Frontend flow tests for onboarding and profile editing.
- Backend persistence tests if new profile endpoints are added.
