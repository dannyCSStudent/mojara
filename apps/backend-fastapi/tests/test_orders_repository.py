import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException

from app.repositories.orders import (
    assert_user_can_view_order,
    decode_cursor,
    encode_cursor,
    refund_order,
)


class OrdersRepositoryTest(unittest.TestCase):
    def test_admin_can_view_any_order(self):
        order = {
            "id": "order-1",
            "user_id": "customer-1",
            "vendor_id": "vendor-1",
        }

        # Should not raise
        assert_user_can_view_order(
            order,
            user_id="admin-user",
            vendor_id=None,
            is_admin=True,
        )

    def test_non_owner_cannot_view_order(self):
        order = {
            "id": "order-1",
            "user_id": "customer-1",
            "vendor_id": "vendor-1",
        }

        with self.assertRaises(HTTPException) as ctx:
            assert_user_can_view_order(
                order,
                user_id="someone-else",
                vendor_id=None,
            )

        self.assertEqual(ctx.exception.status_code, 403)

    def test_cursor_round_trip(self):
        cursor = encode_cursor("2026-03-23T10:00:00Z", "order-1")
        created_at, order_id = decode_cursor(cursor)

        self.assertEqual(created_at, "2026-03-23T10:00:00Z")
        self.assertEqual(order_id, "order-1")

    @patch("app.repositories.orders.get_user_client")
    def test_refund_order_passes_vendor_id_to_rpc(self, mock_get_user_client):
        rpc_execute = Mock()
        rpc_execute.execute.return_value = Mock(data={"id": "order-1"})

        client = Mock()
        client.rpc.return_value = rpc_execute
        mock_get_user_client.return_value = client

        refund_order(
            jwt="token",
            order_id="order-1",
            amount=10,
            reason="test",
            vendor_id="vendor-1",
        )

        client.rpc.assert_called_once_with(
            "refund_order_atomic",
            {
                "p_order_id": "order-1",
                "p_amount": 10,
                "p_reason": "test",
                "p_vendor_id": "vendor-1",
            },
        )


if __name__ == "__main__":
    unittest.main()
