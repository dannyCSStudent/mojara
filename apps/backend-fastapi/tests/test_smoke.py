import unittest

from app.core.permissions import ROLE_PERMISSIONS


class PermissionsSmokeTest(unittest.TestCase):
    def test_expected_roles_exist(self):
        self.assertIn("admin", ROLE_PERMISSIONS)
        self.assertIn("vendor", ROLE_PERMISSIONS)
        self.assertIn("user", ROLE_PERMISSIONS)

    def test_admin_has_wildcard_access(self):
        self.assertIn("*", ROLE_PERMISSIONS["admin"])


if __name__ == "__main__":
    unittest.main()
