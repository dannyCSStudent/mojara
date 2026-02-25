import { AppRole, Permission } from "../../types";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: ["*"],

  moderator: [
    "markets.read",
    "vendors.read",
    "products.read",
    "products.update",
    "products.bulk_update",
    "products.inventory_update",
    "orders.read",
    "orders.vendor_read",
    "orders.confirm",
    "orders.cancel",
    "prices.read",
    "prices.lock",
    "notifications.read",
  ],

  vendor: [
    "markets.read",
    "vendors.read",
    "products.read",
    "orders.vendor_read",
    "orders.confirm",
    "orders.cancel",
    "notifications.read",
  ],

  user: [
    "markets.read",
    "vendors.read",
    "products.read",
    "orders.create",
    "orders.read",
    "prices.signal",
    "prices.read",
    "notifications.read",
    "notifications.create",
    "notifications.update",
  ],
};

