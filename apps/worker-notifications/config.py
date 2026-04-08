import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_env: str
    log_level: str
    metrics_port: int


def load_settings() -> Settings:
    app_env = os.getenv("APP_ENV", "development")
    log_level = os.getenv("WORKER_LOG_LEVEL")

    if not log_level:
        log_level = "WARNING" if app_env == "test" else "INFO"

    metrics_port = int(os.getenv("WORKER_METRICS_PORT", "9100"))

    return Settings(
        app_env=app_env,
        log_level=log_level.upper(),
        metrics_port=metrics_port,
    )


settings = load_settings()
