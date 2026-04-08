import logging
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from app.logging import configure_logging


class LoggingConfigTest(unittest.TestCase):
    def test_configure_logging_sets_app_logger_level_from_settings(self):
        fake_settings = SimpleNamespace(log_level="WARNING")

        with patch("app.logging.settings", fake_settings):
            logger = configure_logging()

        self.assertEqual(logger.name, "mojara.api")
        self.assertEqual(logger.level, logging.WARNING)


if __name__ == "__main__":
    unittest.main()
