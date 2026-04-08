import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException
from postgrest import APIError

from app.repositories.market_subscriptions import (
    create_market_subscription,
    delete_market_subscription,
)


class MarketSubscriptionRepositoryTest(unittest.TestCase):
    @patch("app.repositories.market_subscriptions.get_user_client")
    def test_create_market_subscription_returns_existing_row_for_unique_violation(
        self,
        mock_get_user_client,
    ):
        insert_query = Mock()
        insert_query.execute.side_effect = APIError(
            {
                "message": "duplicate key value violates unique constraint",
                "code": "23505",
            }
        )

        existing_query = Mock()
        existing_query.eq.return_value = existing_query
        existing_query.limit.return_value = existing_query
        existing_query.execute.return_value = Mock(
            data=[
                {
                    "market_id": "market-1",
                    "created_at": "2026-04-08T00:00:00Z",
                }
            ]
        )

        table_mock = Mock()
        table_mock.insert.return_value = insert_query
        table_mock.select.return_value = existing_query

        client = Mock()
        client.table.return_value = table_mock
        mock_get_user_client.return_value = client

        result = create_market_subscription(
            jwt="token",
            user_id="user-1",
            market_id="market-1",
        )

        self.assertEqual(result["market_id"], "market-1")

    @patch("app.repositories.market_subscriptions.get_user_client")
    def test_delete_market_subscription_returns_404_when_missing(self, mock_get_user_client):
        existing_query = Mock()
        existing_query.eq.return_value = existing_query
        existing_query.limit.return_value = existing_query
        existing_query.execute.return_value = Mock(data=[])

        table_mock = Mock()
        table_mock.select.return_value = existing_query

        client = Mock()
        client.table.return_value = table_mock
        mock_get_user_client.return_value = client

        with self.assertRaises(HTTPException) as ctx:
            delete_market_subscription(
                jwt="token",
                user_id="user-1",
                market_id="missing-market",
            )

        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
