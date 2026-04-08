# Ticket 3.2: Harden Order State Machine and Refund Rules

## Title
Harden order state machine and refund rules

## Description
Formalize order lifecycle transitions and refund constraints so behavior is deterministic and safe. Ensure invalid state changes return stable errors and refunds cannot exceed allowed bounds.

## Affected backend files
- `apps/backend-fastapi/app/repositories/orders.py`
- `apps/backend-fastapi/app/routes/orders.py`
- `apps/backend-fastapi/app/schemas/orders.py`

## Affected frontend files
- `apps/frontend-mobile/api/orders.ts`
- `apps/frontend-mobile/app/(private)/orders.tsx`
- `apps/frontend-mobile/app/(private)/orders/[orderId].tsx`

## Database changes
- May require stricter DB-side validation in existing RPCs
- Optional new constraints on refunds or order events

## API endpoints
- `POST /orders/{order_id}/confirm`
- `POST /orders/{order_id}/cancel`
- `POST /orders/{order_id}/refund`
- `GET /orders/{order_id}`

## Acceptance criteria
- Valid transitions succeed and invalid ones return deterministic `409` responses.
- Refunds cannot exceed remaining refundable amount.
- Order detail shows accurate event and refund history.
- Frontend only exposes actions allowed for the current order state and role.

## Test requirements
- Backend tests for all valid and invalid transitions.
- Refund edge-case tests, including over-refund attempts.
- Frontend screen tests for action visibility and error handling.
