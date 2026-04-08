import unittest
from unittest.mock import patch

from fastapi import HTTPException
from uuid import UUID

from app.schemas.orders import CreateOrderPayload, RefundPayload
from app.routes.orders import (
    cancel_order_endpoint,
    create_order_endpoint,
    get_order,
    list_orders_endpoint,
    orders_summary,
    refund_order_route,
)


class OrdersRoutesTest(unittest.TestCase):
    @patch("app.routes.orders.create_order")
    def test_create_order_uses_authenticated_user_instead_of_payload_user(self, mock_create_order):
        mock_create_order.return_value = {"id": "order-1"}

        result = create_order_endpoint(
            market_id=UUID("00000000-0000-0000-0000-000000000010"),
            vendor_id=UUID("00000000-0000-0000-0000-000000000020"),
            payload=CreateOrderPayload(
                user_id=UUID("00000000-0000-0000-0000-000000000030"),
                items=[
                    {
                        "product_id": UUID("00000000-0000-0000-0000-000000000040"),
                        "quantity": 2,
                    }
                ],
            ),
            jwt="token",
            current_user={
                "sub": "authenticated-user",
                "app_role": "user",
                "_jwt": "token",
            },
        )

        self.assertEqual(result["id"], "order-1")
        mock_create_order.assert_called_once_with(
            jwt="token",
            market_id="00000000-0000-0000-0000-000000000010",
            vendor_id="00000000-0000-0000-0000-000000000020",
            customer_id="authenticated-user",
            items=[
                {
                    "product_id": "00000000-0000-0000-0000-000000000040",
                    "quantity": 2,
                }
            ],
        )

    @patch("app.routes.orders.get_orders_for_admin_cursor")
    def test_admin_scope_uses_admin_query(self, mock_get_orders_for_admin_cursor):
        mock_get_orders_for_admin_cursor.return_value = {
            "data": [{"id": "order-1"}],
            "next_cursor": None,
        }

        result = list_orders_endpoint(
            scope="admin",
            status="pending",
            sort="newest",
            search="order",
            cursor=None,
            limit=20,
            jwt="token",
            current_user={
                "sub": "user-1",
                "app_role": "admin",
                "_jwt": "token",
            },
        )

        self.assertEqual(result["data"][0]["id"], "order-1")
        mock_get_orders_for_admin_cursor.assert_called_once_with(
            status="pending",
            sort="newest",
            search="order",
            cursor=None,
            limit=20,
        )

    @patch("app.routes.orders.get_orders_for_admin_cursor")
    def test_admin_scope_rejects_non_admin(self, mock_get_orders_for_admin_cursor):
        with self.assertRaises(HTTPException) as ctx:
            list_orders_endpoint(
                scope="admin",
                status=None,
                sort="newest",
                search=None,
                cursor=None,
                limit=20,
                jwt="token",
                current_user={
                    "sub": "user-1",
                    "app_role": "user",
                    "_jwt": "token",
                },
            )

        self.assertEqual(ctx.exception.status_code, 403)
        mock_get_orders_for_admin_cursor.assert_not_called()

    @patch("app.routes.orders.get_order_by_id")
    def test_get_order_passes_admin_flag_for_admins(self, mock_get_order_by_id):
        mock_get_order_by_id.return_value = {"id": "order-1"}

        result = get_order(
            order_id="00000000-0000-0000-0000-000000000001",
            jwt="token",
            current_user={
                "sub": "user-1",
                "app_role": "admin",
                "vendor_id": None,
                "_jwt": "token",
            },
        )

        self.assertEqual(result["id"], "order-1")
        _, kwargs = mock_get_order_by_id.call_args
        self.assertTrue(kwargs["is_admin"])

    @patch("app.routes.orders.get_orders_summary")
    def test_orders_summary_vendor_scope_returns_zero_for_non_vendor(self, mock_get_orders_summary):
        result = orders_summary(
            scope="vendor",
            current_user={
                "sub": "user-1",
                "vendor_id": None,
                "app_role": "user",
                "_jwt": "token",
            },
        )

        self.assertEqual(result["total_orders"], 0)
        mock_get_orders_summary.assert_not_called()

    @patch("app.routes.orders.get_orders_summary")
    def test_orders_summary_vendor_scope_calls_summary_for_vendor(self, mock_get_orders_summary):
        mock_get_orders_summary.return_value = {
            "total_orders": 5,
            "pending": 1,
            "confirmed": 2,
            "canceled": 0,
            "total_revenue": 120.0,
        }

        result = orders_summary(
            scope="vendor",
            current_user={
                "sub": "vendor-user",
                "vendor_id": "vendor-1",
                "app_role": "vendor",
                "_jwt": "token",
            },
        )

        self.assertEqual(result["total_orders"], 5)
        mock_get_orders_summary.assert_called_once_with(
            jwt="token",
            vendor_id="vendor-1",
        )

    @patch("app.routes.orders.get_orders_summary")
    def test_orders_summary_user_scope_calls_summary(self, mock_get_orders_summary):
        mock_get_orders_summary.return_value = {
            "total_orders": 3,
            "pending": 0,
            "confirmed": 3,
            "canceled": 0,
            "total_revenue": 90.0,
        }

        result = orders_summary(
            current_user={
                "sub": "user-1",
                "vendor_id": None,
                "app_role": "user",
                "_jwt": "token",
            },
        )

        self.assertEqual(result["total_orders"], 3)
        mock_get_orders_summary.assert_called_once_with(
            jwt="token",
            user_id="user-1",
        )

    def test_cancel_requires_vendor_account(self):
        with self.assertRaises(HTTPException) as ctx:
            cancel_order_endpoint(
                order_id="order-1",
                jwt="token",
                current_user={
                    "sub": "user-1",
                    "vendor_id": None,
                    "app_role": "user",
                    "_jwt": "token",
                },
            )

        self.assertEqual(ctx.exception.status_code, 403)

    def test_refund_requires_vendor_account(self):
        with self.assertRaises(HTTPException) as ctx:
            refund_order_route(
                order_id=UUID("00000000-0000-0000-0000-000000000001"),
                payload=RefundPayload(amount=5, reason="test"),
                jwt="token",
                current_user={
                    "sub": "user-1",
                    "vendor_id": None,
                    "app_role": "user",
                    "_jwt": "token",
                },
            )

        self.assertEqual(ctx.exception.status_code, 403)

    @patch("app.routes.orders.refund_order")
    def test_refund_maps_over_refund_error_to_conflict(self, mock_refund_order):
        mock_refund_order.side_effect = Exception("Refund exceeds order total")

        with self.assertRaises(HTTPException) as ctx:
            refund_order_route(
                order_id=UUID("00000000-0000-0000-0000-000000000001"),
                payload=RefundPayload(amount=500, reason="test"),
                jwt="token",
                current_user={
                    "sub": "vendor-user",
                    "vendor_id": "vendor-1",
                    "app_role": "vendor",
                    "_jwt": "token",
                },
            )

        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("remaining refundable amount", ctx.exception.detail)


if __name__ == "__main__":
    unittest.main()
