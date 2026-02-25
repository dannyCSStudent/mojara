# app/core/permissions.py
from typing import Dict, List

# ----------------------------------------
# Permission Registry
# ----------------------------------------

ROLE_PERMISSIONS: Dict[str, List[str]] = {

    # ---------------------------------------------------
    # ADMIN
    # ---------------------------------------------------
    "admin": [
        "*",
    ],

    # ---------------------------------------------------
    # MODERATOR
    # ---------------------------------------------------
    "moderator": [
        # Markets
        "markets.read",

        # Vendors
        "vendors.read",

        # Products
        "products.read",
        "products.update",
        "products.bulk_update",
        "products.inventory_update",

        # Orders
        "orders.read",
        "orders.vendor_read",
        "orders.confirm",
        "orders.cancel",

        # Prices
        "prices.read",
        "prices.lock",

        # Notifications
        "notifications.read",
    ],

    # ---------------------------------------------------
    # VENDOR
    # ---------------------------------------------------
    "vendor": [
        # Vendors (self-management)
        "vendors.read",
        "vendors.update",

        # Products (their products only)
        "products.read",
        "products.update",
        "products.inventory_update",

        # Orders (their orders only)
        "orders.vendor_read",
        "orders.confirm",
        "orders.cancel",

        # Prices
        "prices.read",

        # Notifications
        "notifications.read",
    ],

    # ---------------------------------------------------
    # USER
    # ---------------------------------------------------
    "user": [
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
}

