import io
import json
import unittest
from contextlib import redirect_stdout
from types import SimpleNamespace
from unittest.mock import patch

from logger import log


class LoggerSmokeTest(unittest.TestCase):
    def test_log_outputs_json(self):
        buffer = io.StringIO()

        with patch("logger.settings", SimpleNamespace(log_level="INFO")):
            with redirect_stdout(buffer):
                log("INFO", "worker test", event_id="123")

        payload = json.loads(buffer.getvalue().strip())
        self.assertEqual(payload["level"], "INFO")
        self.assertEqual(payload["message"], "worker test")
        self.assertEqual(payload["event_id"], "123")


if __name__ == "__main__":
    unittest.main()
