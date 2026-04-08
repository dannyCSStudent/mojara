from fastapi import APIRouter, Depends
from app.schemas.dashboard import AdminOverview, OrdersTrendPoint
from app.core.dependencies import require_permissions
from app.repositories.dashboard import (
    get_admin_orders_trend,
    get_admin_overview,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get(
    "/admin/overview",
    response_model=AdminOverview,
    dependencies=[Depends(require_permissions("dashboard.admin"))],
)
async def get_admin_overview_route():
    return get_admin_overview()


@router.get(
    "/admin/orders-trend",
    response_model=list[OrdersTrendPoint],
    dependencies=[Depends(require_permissions("dashboard.admin"))],
)
async def get_admin_orders_trend_route():
    return get_admin_orders_trend()
