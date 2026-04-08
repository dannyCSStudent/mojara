# Ticket 4.1: Add Search and Filter for Markets, Vendors, and Products

## Title
Add search and filter for markets, vendors, and products

## Description
Implement search, filter, and sort across catalog endpoints and screens so users can browse the marketplace efficiently as data volume grows.

## Affected backend files
- `apps/backend-fastapi/app/routes/markets.py`
- `apps/backend-fastapi/app/routes/vendors.py`
- `apps/backend-fastapi/app/routes/products.py`
- Matching repository modules for query support

## Affected frontend files
- `apps/frontend-mobile/api/markets.ts`
- `apps/frontend-mobile/api/vendors.ts`
- `apps/frontend-mobile/api/products.ts`
- `apps/frontend-mobile/app/(private)/markets/[marketId].tsx`
- `apps/frontend-mobile/app/(private)/markets/vendors/[vendorId].tsx`

## Database changes
- Optional indexes for searchable/filterable fields

## API endpoints
- Existing market/vendor/product list endpoints with new query parameters

## Acceptance criteria
- Users can search vendors/products and apply basic filters.
- Backend supports the filter/query parameters efficiently.
- Screens handle loading, empty, and error states cleanly.

## Test requirements
- Backend query tests for search/filter combinations.
- Frontend tests for search/filter interactions and result rendering.
