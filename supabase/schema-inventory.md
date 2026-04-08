# Schema Inventory

This inventory is derived from the current repository code.

## Tables

Core marketplace:
- `markets`
- `vendors`
- `products`
- `inventory_events`
- `market_subscriptions`

Orders:
- `orders`
- `order_items`
- `order_events`
- `refunds`

Pricing:
- `size_bands`
- `price_signals`
- `price_agreements`
- `price_events`

Notifications:
- `notification_subscriptions`
- `notifications`
- `dead_letter_events`

## Views

- `active_price_agreements`
- `price_agreement_explain`

## RPC / SQL functions

- `decrement_product_inventory`
- `create_order_atomic`
- `confirm_order_atomic`
- `cancel_order_atomic`
- `refund_order_atomic`
- `orders_summary_by_scope`
- `notify_price_event`

## Realtime / LISTEN channels

- `price_event_channel`

## Code references

Backend repositories:
- `apps/backend-fastapi/app/repositories/orders.py`
- `apps/backend-fastapi/app/repositories/prices.py`
- `apps/backend-fastapi/app/repositories/notifications.py`
- `apps/backend-fastapi/app/repositories/products.py`
- `apps/backend-fastapi/app/repositories/vendors.py`
- `apps/backend-fastapi/app/repositories/dashboard.py`

Worker:
- `apps/worker-notifications/main.py`
- `apps/worker-notifications/events.py`
- `apps/worker-notifications/notifications.py`
- `apps/worker-notifications/subscriptions.py`

Frontend direct Supabase usage:
- `apps/frontend-mobile/store/useAppStore.ts`
- `apps/frontend-mobile/app/(private)/onboarding.tsx`
- `apps/frontend-mobile/hooks/useOrdersRealtime.ts`
- `apps/frontend-mobile/hooks/useOrdersAdminRealtime.ts`
- `apps/frontend-mobile/hooks/usePriceBoard.ts`

## Known gaps

- The live project's RLS policies are not yet checked in here.
- Existing production data, enums, triggers, and grants may differ from this baseline.
- This baseline should be treated as the repo-owned source for future reconciliation, not as a guaranteed mirror of production.
