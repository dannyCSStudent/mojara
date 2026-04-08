import unittest
from unittest.mock import Mock, patch

from app.repositories.products import get_product_by_id
from app.repositories.products import get_products_for_vendor
from app.repositories.vendors import get_vendor


class VendorProductRepositoriesTest(unittest.TestCase):
    @patch("app.repositories.vendors.get_user_client")
    def test_get_vendor_returns_none_when_row_missing(self, mock_get_user_client):
        query = Mock()
        query.eq.return_value = query
        query.limit.return_value = query
        query.execute.return_value = Mock(data=[])

        table = Mock()
        table.select.return_value = query

        client = Mock()
        client.table.return_value = table
        mock_get_user_client.return_value = client

        result = get_vendor("00000000-0000-0000-0000-000000000001", "token")

        self.assertIsNone(result)

    @patch("app.repositories.products.get_user_client")
    def test_get_product_by_id_returns_none_when_row_missing(self, mock_get_user_client):
        query = Mock()
        query.eq.return_value = query
        query.limit.return_value = query
        query.execute.return_value = Mock(data=[])

        table = Mock()
        table.select.return_value = query

        client = Mock()
        client.table.return_value = table
        mock_get_user_client.return_value = client

        result = get_product_by_id("token", "product-1")

        self.assertIsNone(result)

    @patch("app.repositories.products.get_user_client")
    def test_get_products_for_vendor_selects_fields_required_by_product_out(self, mock_get_user_client):
        query = Mock()
        query.eq.return_value = query
        query.order.return_value = query
        query.execute.return_value = Mock(
            data=[
                {
                    "id": "product-1",
                    "name": "Tomatoes",
                    "price": 5.5,
                    "active": True,
                    "stock_quantity": 12,
                    "is_available": True,
                    "vendor_id": "vendor-1",
                    "created_at": "2026-04-08T00:00:00Z",
                }
            ]
        )

        table = Mock()
        table.select.return_value = query

        client = Mock()
        client.table.return_value = table
        mock_get_user_client.return_value = client

        result = get_products_for_vendor(
            jwt="token",
            market_id="market-1",
            vendor_id="vendor-1",
        )

        self.assertEqual(result[0]["vendor_id"], "vendor-1")
        select_sql = table.select.call_args.args[0]
        self.assertIn("active", select_sql)
        self.assertIn("stock_quantity", select_sql)
        self.assertIn("is_available", select_sql)
        self.assertIn("vendor_id", select_sql)


if __name__ == "__main__":
    unittest.main()
