# app/core/permissions.py
from typing import Dict, List

# ----------------------------------------
# Permission Registry
# ----------------------------------------

ROLE_PERMISSIONS: Dict[str, List[str]] = {
    # ---------------------------------------------------
    # ADMIN
    # ---------------------------------------------------
    # Full system access
    "admin": [
        "*.*",  # Superuser access to everything
    ],

    # ---------------------------------------------------
    # MODERATOR
    # ---------------------------------------------------
    # Operational control, but no destructive admin power
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
    # USER (standard marketplace participant)
    # ---------------------------------------------------
    "user": [
        # Markets
        "markets.read",

        # Vendors
        "vendors.read",

        # Products
        "products.read",

        # Orders
        "orders.create",
        "orders.read",

        # Prices
        "prices.signal",   # can submit price signal
        "prices.read",     # can read current prices

        # Notifications
        "notifications.read",
        "notifications.create",
        "notifications.update",
    ],
}
