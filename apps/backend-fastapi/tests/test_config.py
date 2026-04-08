import os
import unittest
from unittest.mock import patch

from app.config import load_settings, validate_settings


class ConfigTest(unittest.TestCase):
    def test_load_settings_parses_cors_origins(self):
        env = {
            "APP_ENV": "production",
            "SUPABASE_URL": "https://example.supabase.co",
            "SUPABASE_ANON_KEY": "anon",
            "SUPABASE_SERVICE_ROLE_KEY": "service",
            "CORS_ALLOW_ORIGINS": "https://app.example.com, https://admin.example.com",
        }

        with patch.dict(os.environ, env, clear=False):
            settings = load_settings()

        self.assertEqual(settings.app_env, "production")
        self.assertEqual(settings.log_level, "INFO")
        self.assertEqual(
            settings.cors_allow_origins,
            ["https://app.example.com", "https://admin.example.com"],
        )
        self.assertEqual(
            settings.jwks_url,
            "https://example.supabase.co/auth/v1/.well-known/jwks.json",
        )

    def test_load_settings_uses_local_defaults_when_cors_missing(self):
        with patch.dict("os.environ", {}, clear=True):
            settings = load_settings()

        self.assertIn("http://localhost:8000", settings.cors_allow_origins)
        self.assertEqual(settings.supabase_jwt_audience, "authenticated")
        self.assertEqual(settings.log_level, "INFO")

    def test_validate_settings_reports_missing_required_backend_values(self):
        with patch.dict("os.environ", {}, clear=True):
            settings = load_settings()

        errors = validate_settings(settings)

        self.assertIn("SUPABASE_URL is required", errors)
        self.assertIn("SUPABASE_ANON_KEY is required", errors)
        self.assertIn("SUPABASE_SERVICE_ROLE_KEY is required", errors)

    def test_load_settings_defaults_test_env_to_warning_log_level(self):
        with patch.dict("os.environ", {"APP_ENV": "test"}, clear=True):
            settings = load_settings()

        self.assertEqual(settings.log_level, "WARNING")


if __name__ == "__main__":
    unittest.main()
