import unittest
from unittest.mock import patch
from uuid import UUID

from app.routes.markets import get_inventory_events


class InventoryEventRoutesTest(unittest.TestCase):
    @patch("app.routes.markets.list_inventory_events")
    def test_inventory_event_route_uses_product_scope(self, mock_list_inventory_events):
        mock_list_inventory_events.return_value = [
            {
                "id": "00000000-0000-0000-0000-000000000011",
                "product_id": "00000000-0000-0000-0000-000000000003",
                "vendor_id": "00000000-0000-0000-0000-000000000002",
                "market_id": "00000000-0000-0000-0000-000000000001",
                "event_type": "manual_adjustment",
                "stock_quantity_before": 8,
                "stock_quantity_after": 12,
                "change_amount": 4,
                "is_available_before": True,
                "is_available_after": True,
                "created_at": "2026-03-23T00:00:00Z",
            }
        ]

        result = get_inventory_events(
            market_id=UUID("00000000-0000-0000-0000-000000000001"),
            vendor_id=UUID("00000000-0000-0000-0000-000000000002"),
            product_id=UUID("00000000-0000-0000-0000-000000000003"),
            limit=5,
            jwt="token",
        )

        self.assertEqual(result[0]["event_type"], "manual_adjustment")
        mock_list_inventory_events.assert_called_once_with(
            jwt="token",
            market_id="00000000-0000-0000-0000-000000000001",
            vendor_id="00000000-0000-0000-0000-000000000002",
            product_id="00000000-0000-0000-0000-000000000003",
            limit=5,
        )


if __name__ == "__main__":
    unittest.main()
