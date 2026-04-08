import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.routes.users import change_user_role, get_user_route, list_users_route
from app.schemas.users import UserRoleUpdateIn


class UsersRoutesTest(unittest.TestCase):
    @patch("app.routes.users.list_users")
    def test_list_users_uses_query_params(self, mock_list_users):
        mock_list_users.return_value = {
            "items": [
                {
                    "id": "user-1",
                    "email": "user@example.com",
                    "role": "user",
                    "vendor_id": None,
                    "created_at": None,
                    "last_sign_in_at": None,
                }
            ],
            "page": 2,
            "per_page": 25,
            "has_more": True,
        }

        result = list_users_route(
            search="user",
            role="vendor",
            vendor_id="vendor-1",
            sort_field="created_at",
            sort_direction="desc",
            page=2,
            per_page=25,
        )

        self.assertEqual(result["items"][0]["id"], "user-1")
        self.assertTrue(result["has_more"])
        mock_list_users.assert_called_once_with(
            search="user",
            role="vendor",
            vendor_id="vendor-1",
            sort_field="created_at",
            sort_direction="desc",
            page=2,
            per_page=25,
        )

    def test_list_users_rejects_invalid_role(self):
        with self.assertRaises(HTTPException) as ctx:
            list_users_route(role="invalid")

        self.assertEqual(ctx.exception.status_code, 400)

    def test_list_users_rejects_invalid_sort_field(self):
        with self.assertRaises(HTTPException) as ctx:
            list_users_route(sort_field="invalid")

        self.assertEqual(ctx.exception.status_code, 400)

    def test_list_users_rejects_invalid_sort_direction(self):
        with self.assertRaises(HTTPException) as ctx:
            list_users_route(sort_direction="sideways")

        self.assertEqual(ctx.exception.status_code, 400)

    @patch("app.routes.users.get_user")
    def test_get_user_route_returns_user(self, mock_get_user):
        mock_get_user.return_value = {
            "id": "user-1",
            "email": "user@example.com",
            "role": "user",
            "vendor_id": None,
            "created_at": None,
            "last_sign_in_at": None,
        }

        result = get_user_route("user-1")

        self.assertEqual(result["id"], "user-1")
        mock_get_user.assert_called_once_with("user-1")

    @patch("app.routes.users.get_user")
    def test_get_user_route_returns_404_for_missing_user(self, mock_get_user):
        mock_get_user.return_value = None

        with self.assertRaises(HTTPException) as ctx:
            get_user_route("missing")

        self.assertEqual(ctx.exception.status_code, 404)

    @patch("app.routes.users.update_user_role")
    def test_change_user_role_uses_payload(self, mock_update_user_role):
        mock_update_user_role.return_value = {"ok": True}

        result = change_user_role(
            user_id="user-1",
            payload=UserRoleUpdateIn(new_role="vendor"),
        )

        self.assertEqual(result, {"ok": True})
        mock_update_user_role.assert_called_once_with("user-1", "vendor")

    def test_change_user_role_rejects_invalid_role(self):
        with self.assertRaises(HTTPException) as ctx:
            change_user_role(
                user_id="user-1",
                payload=UserRoleUpdateIn(new_role="invalid"),
            )

        self.assertEqual(ctx.exception.status_code, 400)

    @patch("app.routes.users.update_user_role")
    def test_change_user_role_returns_404_for_missing_user(self, mock_update_user_role):
        mock_update_user_role.return_value = None

        with self.assertRaises(HTTPException) as ctx:
            change_user_role(
                user_id="missing",
                payload=UserRoleUpdateIn(new_role="vendor"),
            )

        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
