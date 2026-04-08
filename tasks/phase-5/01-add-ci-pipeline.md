# Ticket 5.1: Add CI Pipeline for Lint, Types, Tests, and Contract Checks

## Title
Add CI pipeline for lint, types, tests, and contract checks

## Description
Create a CI workflow that validates the monorepo consistently on every change. It should run the same commands developers run locally and cover the frontend, shared packages, backend, and worker.

## Affected backend files
- CI workflow files to add under `.github/workflows/` or the repo's chosen CI system
- Root/package config files used by the workflow

## Affected frontend files
- Root and package scripts/configs consumed by CI

## Database changes
None.

## API endpoints
None.

## Acceptance criteria
- CI runs lint, type checks, backend tests, frontend tests, and contract/schema checks.
- Failing checks fail the pipeline.
- CI commands match documented local developer commands.

## Test requirements
- Smoke validation of the workflow on a sample branch.
- Documented instructions for reproducing CI failures locally.
