import os
import unittest
from unittest.mock import patch

from config import load_settings


class WorkerConfigTest(unittest.TestCase):
    def test_load_settings_defaults_test_env_to_warning(self):
        with patch.dict(os.environ, {"APP_ENV": "test"}, clear=True):
            settings = load_settings()

        self.assertEqual(settings.log_level, "WARNING")
        self.assertEqual(settings.metrics_port, 9100)

    def test_load_settings_uses_explicit_metrics_port(self):
        with patch.dict(
            os.environ,
            {
                "APP_ENV": "production",
                "WORKER_LOG_LEVEL": "debug",
                "WORKER_METRICS_PORT": "9200",
            },
            clear=True,
        ):
            settings = load_settings()

        self.assertEqual(settings.log_level, "DEBUG")
        self.assertEqual(settings.metrics_port, 9200)


if __name__ == "__main__":
    unittest.main()
