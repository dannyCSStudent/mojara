import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []

    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_env: str
    log_level: str
    supabase_url: str | None
    supabase_anon_key: str | None
    supabase_service_role_key: str | None
    supabase_jwt_audience: str
    cors_allow_origins: list[str]

    @property
    def supabase_issuer(self) -> str | None:
        if not self.supabase_url:
            return None
        return f"{self.supabase_url}/auth/v1"

    @property
    def jwks_url(self) -> str | None:
        if not self.supabase_issuer:
            return None
        return f"{self.supabase_issuer}/.well-known/jwks.json"


def validate_settings(config: Settings) -> list[str]:
    errors: list[str] = []

    if not config.supabase_url:
        errors.append("SUPABASE_URL is required")

    if not config.supabase_anon_key:
        errors.append("SUPABASE_ANON_KEY is required")

    if not config.supabase_service_role_key:
        errors.append("SUPABASE_SERVICE_ROLE_KEY is required")

    if not config.cors_allow_origins:
        errors.append("At least one CORS origin must be configured")

    return errors


def load_settings() -> Settings:
    app_env = os.getenv("APP_ENV", "development")
    log_level = os.getenv("LOG_LEVEL")
    cors_allow_origins = _split_csv(os.getenv("CORS_ALLOW_ORIGINS"))

    if not log_level:
        log_level = "WARNING" if app_env == "test" else "INFO"

    if not cors_allow_origins:
        cors_allow_origins = [
            "http://localhost:19006",
            "http://localhost:3000",
            "http://localhost:8000",
            "exp://127.0.0.1:19000",
        ]

    return Settings(
        app_env=app_env,
        log_level=log_level.upper(),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_anon_key=os.getenv("SUPABASE_ANON_KEY"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        supabase_jwt_audience=os.getenv("SUPABASE_JWT_AUDIENCE", "authenticated"),
        cors_allow_origins=cors_allow_origins,
    )


settings = load_settings()
settings_errors = validate_settings(settings)
