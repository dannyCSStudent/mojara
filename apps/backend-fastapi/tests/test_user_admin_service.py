import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from app.services.user_admin import (
    _extract_get_user_response,
    _extract_list_users_response,
    _matches_user_filters,
    _normalize_user,
    _user_sort_key,
    get_user,
    list_users,
    update_user_role,
)


class UserAdminServiceTest(unittest.TestCase):
    def test_extract_list_users_response_supports_object_shape(self):
        response = SimpleNamespace(users=[{"id": "user-1"}])

        result = _extract_list_users_response(response)

        self.assertEqual(result, [{"id": "user-1"}])

    def test_extract_list_users_response_supports_dict_shape(self):
        response = {"data": {"users": [{"id": "user-2"}]}}

        result = _extract_list_users_response(response)

        self.assertEqual(result, [{"id": "user-2"}])

    def test_extract_get_user_response_supports_object_shape(self):
        response = SimpleNamespace(user={"id": "user-1"})

        result = _extract_get_user_response(response)

        self.assertEqual(result, {"id": "user-1"})

    def test_extract_get_user_response_supports_dict_shape(self):
        response = {"data": {"user": {"id": "user-2"}}}

        result = _extract_get_user_response(response)

        self.assertEqual(result, {"id": "user-2"})

    def test_normalize_user_defaults_missing_metadata_and_dates(self):
        result = _normalize_user(
            {
                "id": "user-1",
                "email": None,
                "app_metadata": None,
            }
        )

        self.assertEqual(
            result,
            {
                "id": "user-1",
                "email": None,
                "role": "user",
                "vendor_id": None,
                "created_at": None,
                "last_sign_in_at": None,
            },
        )

    def test_matches_user_filters_handles_sparse_user_fields(self):
        user = {
            "id": "user-1",
            "email": None,
            "role": "user",
            "vendor_id": None,
            "created_at": None,
            "last_sign_in_at": None,
        }

        self.assertTrue(_matches_user_filters(user, query="user-1"))
        self.assertFalse(_matches_user_filters(user, query="vendor"))
        self.assertTrue(_matches_user_filters(user, role_filter="user"))
        self.assertFalse(_matches_user_filters(user, vendor_filter="vendor-1"))

    def test_user_sort_key_places_none_after_present_values(self):
        present = _user_sort_key({"email": "alpha@example.com"}, "email")
        missing = _user_sort_key({"email": None}, "email")

        self.assertLess(present, missing)

    def test_user_sort_key_normalizes_string_case(self):
        lower = _user_sort_key({"email": "alpha@example.com"}, "email")
        upper = _user_sort_key({"email": "ALPHA@example.com"}, "email")

        self.assertEqual(lower, upper)

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_normalizes_and_filters_results(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": "vendor@example.com",
                    "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "admin@example.com",
                    "app_metadata": {"role": "admin"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(search="vendor", page=1, per_page=50)

        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["role"], "vendor")
        self.assertEqual(result["items"][0]["vendor_id"], "vendor-1")
        self.assertFalse(result["has_more"])
        admin.list_users.assert_called_once_with(page=1, per_page=50)

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_filters_by_role(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": "vendor@example.com",
                    "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "user@example.com",
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(role="vendor", page=1, per_page=50)

        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["id"], "user-1")

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_filters_by_vendor_id(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": "vendor@example.com",
                    "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "other@example.com",
                    "app_metadata": {"role": "vendor", "vendor_id": "vendor-2"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(vendor_id="vendor-1", page=1, per_page=50)

        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["id"], "user-1")

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_sorts_by_requested_field_and_direction(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": "zeta@example.com",
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "alpha@example.com",
                    "app_metadata": {"role": "vendor"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(sort_field="email", sort_direction="desc", page=1, per_page=50)

        self.assertEqual(result["items"][0]["id"], "user-1")
        self.assertEqual(result["items"][1]["id"], "user-2")

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_sorts_null_values_last_for_ascending(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": None,
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "alpha@example.com",
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(sort_field="email", sort_direction="asc", page=1, per_page=50)

        self.assertEqual(result["items"][0]["id"], "user-2")
        self.assertEqual(result["items"][1]["id"], "user-1")

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_sorts_null_values_first_for_descending(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.return_value = SimpleNamespace(
            users=[
                {
                    "id": "user-1",
                    "email": None,
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
                {
                    "id": "user-2",
                    "email": "alpha@example.com",
                    "app_metadata": {"role": "user"},
                    "created_at": None,
                    "last_sign_in_at": None,
                },
            ]
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(sort_field="email", sort_direction="desc", page=1, per_page=50)

        self.assertEqual(result["items"][0]["id"], "user-1")
        self.assertEqual(result["items"][1]["id"], "user-2")

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_filters_across_multiple_source_pages(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.side_effect = [
            SimpleNamespace(
                users=[
                    {
                        "id": "user-1",
                        "email": "alpha@example.com",
                        "app_metadata": {"role": "user"},
                        "created_at": None,
                        "last_sign_in_at": None,
                    }
                ]
            ),
            SimpleNamespace(
                users=[
                    {
                        "id": "user-2",
                        "email": "vendor@example.com",
                        "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                        "created_at": None,
                        "last_sign_in_at": None,
                    }
                ]
            ),
            SimpleNamespace(users=[]),
        ]

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(search="vendor", page=1, per_page=1)

        self.assertEqual([user["id"] for user in result["items"]], ["user-2"])
        self.assertFalse(result["has_more"])
        self.assertEqual(admin.list_users.call_count, 3)

    @patch("app.services.user_admin.get_service_client")
    def test_list_users_paginates_filtered_results(self, mock_get_service_client):
        admin = Mock()
        admin.list_users.side_effect = [
            SimpleNamespace(
                users=[
                    {
                        "id": "user-1",
                        "email": "first@example.com",
                        "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                        "created_at": None,
                        "last_sign_in_at": None,
                    }
                ]
            ),
            SimpleNamespace(
                users=[
                    {
                        "id": "user-2",
                        "email": "second@example.com",
                        "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                        "created_at": None,
                        "last_sign_in_at": None,
                    }
                ]
            ),
            SimpleNamespace(users=[]),
        ]

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = list_users(role="vendor", page=2, per_page=1)

        self.assertEqual([user["id"] for user in result["items"]], ["user-2"])
        self.assertFalse(result["has_more"])

    @patch("app.services.user_admin.get_user")
    @patch("app.services.user_admin.get_service_client")
    def test_update_user_role_preserves_vendor_id(self, mock_get_service_client, mock_get_user):
        admin = Mock()
        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client
        mock_get_user.return_value = {
            "id": "user-1",
            "email": "vendor@example.com",
            "role": "vendor",
            "vendor_id": "vendor-1",
            "created_at": None,
            "last_sign_in_at": None,
        }

        update_user_role("user-1", "vendor")

        admin.update_user_by_id.assert_called_once_with(
            "user-1",
            {
                "app_metadata": {
                    "role": "vendor",
                    "vendor_id": "vendor-1",
                }
            },
        )

    @patch("app.services.user_admin.get_service_client")
    def test_get_user_normalizes_result(self, mock_get_service_client):
        admin = Mock()
        admin.get_user_by_id.return_value = SimpleNamespace(
            user={
                "id": "user-1",
                "email": "vendor@example.com",
                "app_metadata": {"role": "vendor", "vendor_id": "vendor-1"},
                "created_at": None,
                "last_sign_in_at": None,
            }
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = get_user("user-1")

        self.assertEqual(result["id"], "user-1")
        self.assertEqual(result["role"], "vendor")
        self.assertEqual(result["vendor_id"], "vendor-1")
        admin.get_user_by_id.assert_called_once_with("user-1")

    @patch("app.services.user_admin.get_service_client")
    def test_get_user_normalizes_missing_metadata(self, mock_get_service_client):
        admin = Mock()
        admin.get_user_by_id.return_value = SimpleNamespace(
            user={
                "id": "user-2",
                "email": None,
                "created_at": None,
                "last_sign_in_at": None,
            }
        )

        client = Mock()
        client.auth.admin = admin
        mock_get_service_client.return_value = client

        result = get_user("user-2")

        self.assertEqual(result["role"], "user")
        self.assertIsNone(result["vendor_id"])


if __name__ == "__main__":
    unittest.main()
