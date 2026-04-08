import unittest
from unittest.mock import Mock, patch
from uuid import UUID

from fastapi import HTTPException

from app.repositories.prices import lock_price_agreement


class PricesRepositoryTest(unittest.TestCase):
    @patch("app.repositories.prices.get_user_client")
    def test_lock_price_agreement_returns_404_when_missing(self, mock_get_user_client):
        query = Mock()
        query.eq.return_value = query
        query.limit.return_value = query
        query.execute.return_value = Mock(data=[])

        table = Mock()
        table.select.return_value = query

        client = Mock()
        client.from_.return_value = table
        mock_get_user_client.return_value = client

        with self.assertRaises(HTTPException) as ctx:
            lock_price_agreement(UUID("00000000-0000-0000-0000-000000000001"), "token")

        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
