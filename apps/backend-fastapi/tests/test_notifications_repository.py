import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException

from app.repositories.notifications import create_subscription
from app.repositories.notifications import delete_subscription, mark_notification_read


class NotificationsRepositoryTest(unittest.TestCase):
    @patch("app.repositories.notifications.get_user_client")
    def test_create_subscription_rejects_exact_duplicate(self, mock_get_user_client):
        existing_query = Mock()
        existing_query.eq.return_value = existing_query
        existing_query.limit.return_value = existing_query
        existing_query.execute.return_value = Mock(data=[{"id": "sub-1"}])

        table_mock = Mock()
        table_mock.select.return_value = existing_query

        client = Mock()
        client.table.return_value = table_mock
        mock_get_user_client.return_value = client

        with self.assertRaises(HTTPException) as ctx:
            create_subscription(
                jwt="token",
                user_id="user-1",
                payload={
                    "vendor_id": "vendor-1",
                    "event_type": "price_increase",
                    "min_severity": 2,
                    "channel": "push",
                },
            )

        self.assertEqual(ctx.exception.status_code, 409)

    @patch("app.repositories.notifications.get_user_client")
    def test_delete_subscription_returns_404_when_missing(self, mock_get_user_client):
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
            delete_subscription(
                jwt="token",
                subscription_id="missing-subscription",
                user_id="user-1",
            )

        self.assertEqual(ctx.exception.status_code, 404)

    @patch("app.repositories.notifications.get_user_client")
    def test_mark_notification_read_returns_404_when_missing(self, mock_get_user_client):
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
            mark_notification_read(
                jwt="token",
                notification_id="missing-notification",
                user_id="user-1",
            )

        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
