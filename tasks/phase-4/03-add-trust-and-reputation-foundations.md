# Ticket 4.3: Add Trust and Reputation Foundations

## Title
Add trust and reputation foundations

## Description
Introduce basic trust signals such as vendor reliability, fulfillment history, or participation indicators. These should be explainable metrics, not opaque scoring.

## Affected backend files
- Vendor-related repositories and schemas
- Optional new trust metrics endpoints

## Affected frontend files
- Vendor detail and marketplace listing screens
- Shared types package if new response shapes are added

## Database changes
- Optional aggregate views/materializations or derived metric tables

## API endpoints
- `GET /vendors/{vendor_id}/trust` or embed trust fields into existing vendor payloads

## Acceptance criteria
- Vendor trust data is visible in relevant UI surfaces.
- Metrics are clearly defined and reproducible.
- No placeholder scoring remains in production responses.

## Test requirements
- Backend tests for metric calculation.
- Frontend rendering tests for trust indicators.
