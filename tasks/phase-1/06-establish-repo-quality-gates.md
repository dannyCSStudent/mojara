# Ticket 1.6: Establish Repo-Wide Quality Gates

## Title
Establish repo-wide quality gates

## Description
Add lint, type-check, and test scripts for backend, worker, frontend, and shared packages so Turborepo validates the whole repository rather than a narrow subset. Current checks miss most of the codebase.

## Affected backend files
- `apps/backend-fastapi/package.json`
- Python lint/test config files to add, such as `pyproject.toml` or tool config files
- `apps/worker-notifications/` package or config files if added

## Affected frontend files
- `apps/frontend-mobile/package.json`
- `packages/permissions/package.json`
- `packages/types/package.json`
- Any root script/config files needed to wire Turbo tasks

## Database changes
None.

## API endpoints
None.

## Acceptance criteria
- `pnpm lint` covers intended frontend/shared packages and backend/worker linting where applicable.
- `pnpm check-types` covers the mobile app and shared TS packages.
- Backend and worker test commands exist and run through the monorepo.
- Root scripts and Turbo tasks are CI-ready.

## Test requirements
- Validate that repo-level commands execute the intended package scripts.
- Add at least smoke tests proving the new test/lint/type pipelines run.
