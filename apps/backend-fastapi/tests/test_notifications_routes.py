import unittest
from unittest.mock import patch

from app.routes.notifications import mark_all_read, subscribe
from app.schemas.notifications import NotificationSubscriptionIn


class NotificationsRoutesTest(unittest.TestCase):
    @patch("app.routes.notifications.create_subscription")
    def test_subscribe_uses_current_user(self, mock_create_subscription):
        mock_create_subscription.return_value = {
            "id": "sub-1",
            "user_id": "user-1",
            "vendor_id": "vendor-1",
            "event_type": "price_increase",
            "min_severity": 2,
            "channel": "push",
            "active": True,
            "created_at": "2026-03-23T00:00:00Z",
        }

        payload = NotificationSubscriptionIn(
            vendor_id="00000000-0000-0000-0000-000000000001",
            event_type="price_increase",
            min_severity=2,
            channel="push",
        )

        result = subscribe(
            payload=payload,
            current_user={"sub": "user-1", "_jwt": "token"},
        )

        self.assertEqual(result["user_id"], "user-1")
        mock_create_subscription.assert_called_once_with(
            jwt="token",
            user_id="user-1",
            payload={
                "vendor_id": payload.vendor_id,
                "event_type": "price_increase",
                "min_severity": 2,
                "channel": "push",
            },
        )

    @patch("app.routes.notifications.mark_all_notifications_read")
    def test_mark_all_read_uses_current_user(self, mock_mark_all_notifications_read):
        mock_mark_all_notifications_read.return_value = 4

        result = mark_all_read(
            current_user={"sub": "user-1", "_jwt": "token"},
        )

        self.assertEqual(result, {"ok": True, "updated": 4})
        mock_mark_all_notifications_read.assert_called_once_with(
            jwt="token",
            user_id="user-1",
        )


if __name__ == "__main__":
    unittest.main()
