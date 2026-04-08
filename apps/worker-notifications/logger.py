# worker-notifications/logger.py

import json
from datetime import datetime, UTC
from config import settings


def log(level: str, message: str, **kwargs):
    level_name = level.upper()
    configured_level = settings.log_level.upper()
    level_order = {
        "DEBUG": 10,
        "INFO": 20,
        "WARNING": 30,
        "ERROR": 40,
    }

    if level_order.get(level_name, 20) < level_order.get(configured_level, 20):
        return

    log_entry = {
        "timestamp": datetime.now(UTC).isoformat(),
        "level": level_name,
        "message": message,
        **kwargs,
    }

    print(json.dumps(log_entry))
