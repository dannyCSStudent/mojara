# worker-notifications/logger.py

import json
from datetime import datetime


def log(level: str, message: str, **kwargs):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        **kwargs,
    }

    print(json.dumps(log_entry))
