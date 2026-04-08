import unittest
from unittest.mock import Mock, patch

from app.repositories.products import get_product_by_id
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


if __name__ == "__main__":
    unittest.main()
