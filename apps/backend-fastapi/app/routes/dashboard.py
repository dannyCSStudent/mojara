from fastapi import APIRouter, Depends
from app.schemas.dashboard import AdminOverview
from app.core.dependencies import require_permissions

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get(
    "/admin/overview",
    response_model=AdminOverview,
    dependencies=[Depends(require_permissions("dashboard.admin"))]
)
async def get_admin_overview():
    # temporary mock until repo implemented
    return AdminOverview(
        total_orders_7d=124,
        orders_today=18,
        active_vendors=42,
        active_price_agreements=9,
        pending_orders=6,
    )
