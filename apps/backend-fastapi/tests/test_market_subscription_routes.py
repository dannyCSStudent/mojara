import unittest
from unittest.mock import patch

from app.routes.market_subscriptions import (
    create_my_market_subscription,
    delete_my_market_subscription,
    get_my_market_subscriptions,
)
from app.schemas.market_subscriptions import MarketSubscriptionCreate


class MarketSubscriptionRoutesTest(unittest.TestCase):
    @patch("app.routes.market_subscriptions.list_market_subscriptions")
    def test_list_market_subscriptions_uses_current_user(self, mock_list_market_subscriptions):
        mock_list_market_subscriptions.return_value = [
            {
                "market_id": "00000000-0000-0000-0000-000000000001",
                "created_at": "2026-03-23T00:00:00Z",
            }
        ]

        result = get_my_market_subscriptions(
            current_user={"sub": "user-1", "_jwt": "token"}
        )

        self.assertEqual(len(result), 1)
        mock_list_market_subscriptions.assert_called_once_with(
            jwt="token",
            user_id="user-1",
        )

    @patch("app.routes.market_subscriptions.create_market_subscription")
    def test_create_market_subscription_uses_current_user(self, mock_create_market_subscription):
        mock_create_market_subscription.return_value = {
            "market_id": "00000000-0000-0000-0000-000000000001",
            "created_at": "2026-03-23T00:00:00Z",
        }

        payload = MarketSubscriptionCreate(
            market_id="00000000-0000-0000-0000-000000000001"
        )

        result = create_my_market_subscription(
            payload=payload,
            current_user={"sub": "user-1", "_jwt": "token"},
        )

        self.assertEqual(
            result["market_id"], "00000000-0000-0000-0000-000000000001"
        )
        mock_create_market_subscription.assert_called_once_with(
            jwt="token",
            user_id="user-1",
            market_id="00000000-0000-0000-0000-000000000001",
        )

    @patch("app.routes.market_subscriptions.delete_market_subscription")
    def test_delete_market_subscription_uses_current_user(self, mock_delete_market_subscription):
        result = delete_my_market_subscription(
            market_id="market-1",
            current_user={"sub": "user-1", "_jwt": "token"},
        )

        self.assertEqual(result, {"ok": True})
        mock_delete_market_subscription.assert_called_once_with(
            jwt="token",
            user_id="user-1",
            market_id="market-1",
        )


if __name__ == "__main__":
    unittest.main()
