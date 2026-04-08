import unittest

from app.repositories.orders import _normalize_order


class OrdersContractTest(unittest.TestCase):
    def test_normalized_order_contains_named_items_unit_prices_and_events(self):
        order = {
            "id": "order-1",
            "market_id": "market-1",
            "vendor_id": "vendor-1",
            "user_id": "user-1",
            "status": "confirmed",
            "total": 20,
            "created_at": "2026-03-23T10:00:00Z",
            "order_items": [
                {
                    "product_id": "product-1",
                    "quantity": 2,
                    "unit_price": 5,
                    "products": {"name": "Tomatoes"},
                },
                {
                    "product_id": "product-2",
                    "quantity": 1,
                    "unit_price": 10,
                    "line_total": 10,
                    "products": {"name": "Peppers"},
                },
            ],
            "refunds": [
                {
                    "id": "refund-1",
                    "amount": 3,
                    "reason": "adjustment",
                    "created_at": "2026-03-23T11:00:00Z",
                }
            ],
            "order_events": [
                {
                    "id": "event-2",
                    "event": "confirmed",
                    "amount": None,
                    "reason": None,
                    "created_at": "2026-03-23T11:30:00Z",
                },
                {
                    "id": "event-1",
                    "event": "created",
                    "amount": None,
                    "reason": None,
                    "created_at": "2026-03-23T10:30:00Z",
                },
            ],
        }

        normalized = _normalize_order(order)

        self.assertEqual(normalized["items"][0]["name"], "Tomatoes")
        self.assertEqual(normalized["items"][0]["unit_price"], 5)
        self.assertEqual(normalized["items"][0]["line_total"], 10)
        self.assertEqual(normalized["items"][1]["line_total"], 10)
        self.assertEqual(normalized["refunded_total"], 3)
        self.assertEqual(
            [event["type"] for event in normalized["events"]],
            ["created", "confirmed"],
        )


if __name__ == "__main__":
    unittest.main()
