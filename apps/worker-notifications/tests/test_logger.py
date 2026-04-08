import io
import json
import unittest
from contextlib import redirect_stdout
from types import SimpleNamespace
from unittest.mock import patch

import logger


class WorkerLoggerTest(unittest.TestCase):
    def test_log_outputs_json_when_level_is_enabled(self):
        buffer = io.StringIO()

        with patch.object(logger, "settings", SimpleNamespace(log_level="INFO")):
            with redirect_stdout(buffer):
                logger.log("INFO", "worker test", event_id="123")

        payload = json.loads(buffer.getvalue().strip())
        self.assertEqual(payload["level"], "INFO")
        self.assertEqual(payload["message"], "worker test")
        self.assertEqual(payload["event_id"], "123")

    def test_log_suppresses_messages_below_configured_level(self):
        buffer = io.StringIO()

        with patch.object(logger, "settings", SimpleNamespace(log_level="ERROR")):
            with redirect_stdout(buffer):
                logger.log("INFO", "suppressed message")

        self.assertEqual(buffer.getvalue(), "")


if __name__ == "__main__":
    unittest.main()
