import logging

from app.config import settings


def configure_logging() -> logging.Logger:
    level_name = settings.log_level.upper()
    level = getattr(logging, level_name, logging.INFO)

    root_logger = logging.getLogger()
    if not root_logger.handlers:
        logging.basicConfig(
            level=level,
            format="%(levelname)s:%(name)s:%(message)s",
        )
    else:
        root_logger.setLevel(level)

    logging.getLogger("httpx").setLevel(max(level, logging.WARNING))
    logging.getLogger("uvicorn.access").setLevel(max(level, logging.INFO))

    logger = logging.getLogger("mojara.api")
    logger.setLevel(level)
    return logger
