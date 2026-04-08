from contextlib import asynccontextmanager
import time
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, settings_errors
from app.logging import configure_logging
from app.routes import ( markets,
                        market_subscriptions,
                        vendors, 
                        products, 
                        orders, 
                        prices, 
                        admin_prices,
                        notifications,
                        admin,
                        dashboard,
                        users,
                 )

logger = configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings_errors:
        logger.warning(
            "startup_config_invalid errors=%s",
            settings_errors,
        )
    yield

app = FastAPI(title="Mojara API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    request.state.request_id = request_id
    started_at = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.exception(
            "request_failed method=%s path=%s request_id=%s duration_ms=%s",
            request.method,
            request.url.path,
            request_id,
            duration_ms,
        )
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request_complete method=%s path=%s status=%s request_id=%s duration_ms=%s",
        request.method,
        request.url.path,
        response.status_code,
        request_id,
        duration_ms,
    )
    return response

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "backend-fastapi",
        "version": "0.1.0"
    }


@app.get("/ready")
def ready():
    if settings_errors:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "service": "backend-fastapi",
                "errors": settings_errors,
            },
        )

    return {
        "status": "ready",
        "service": "backend-fastapi",
        "jwks_url": settings.jwks_url,
        "cors_allow_origins": settings.cors_allow_origins,
    }


app.include_router(markets.router)
app.include_router(market_subscriptions.router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(prices.router)
app.include_router(admin_prices.router, prefix="/admin", tags=["admin"])
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(dashboard.router)
app.include_router(users.router)
