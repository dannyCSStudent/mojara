# Ticket 3.1: Implement Vendor/Admin Inventory Audit Trail

## Title
Implement vendor/admin inventory audit trail

## Description
Add inventory history so stock movements are traceable across manual edits, order creation, order cancellation, confirmation, and refunds. The goal is operational auditability and easier reconciliation.

## Affected backend files
- `apps/backend-fastapi/app/repositories/products.py`
- `apps/backend-fastapi/app/repositories/inventory.py`
- Inventory-related routes in `apps/backend-fastapi/app/routes/markets.py`

## Affected frontend files
- Product/inventory management screens if surfaced in UI

## Database changes
- Add `inventory_events` table
- Include fields such as `product_id`, `vendor_id`, `delta`, `reason`, `source_type`, `source_id`, `actor_id`, `created_at`

## API endpoints
- Existing inventory mutation endpoints
- Optional `GET /vendors/{vendor_id}/inventory-events`

## Acceptance criteria
- Every inventory-affecting action writes an audit event.
- Inventory history can be queried for a product/vendor.
- Order-related stock changes reconcile with manual adjustments.

## Test requirements
- Backend tests asserting audit event creation for each mutation path.
- DB tests for event integrity and required fields.
