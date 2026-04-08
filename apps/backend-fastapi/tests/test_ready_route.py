import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

import main


class ReadyRouteTest(unittest.TestCase):
    def test_ready_returns_runtime_summary_when_config_valid(self):
        fake_settings = SimpleNamespace(
            jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
            cors_allow_origins=["http://localhost:3000"],
        )

        with patch("main.settings_errors", []), patch("main.settings", fake_settings):
            result = main.ready()

        self.assertEqual(result["status"], "ready")
        self.assertEqual(result["service"], "backend-fastapi")
        self.assertEqual(
            result["jwks_url"],
            "https://example.supabase.co/auth/v1/.well-known/jwks.json",
        )

    @patch("main.settings_errors", ["SUPABASE_URL is required"])
    def test_ready_returns_503_when_config_invalid(self):
        with self.assertRaises(HTTPException) as ctx:
            main.ready()

        self.assertEqual(ctx.exception.status_code, 503)
        self.assertEqual(
            ctx.exception.detail["errors"],
            ["SUPABASE_URL is required"],
        )


if __name__ == "__main__":
    unittest.main()
