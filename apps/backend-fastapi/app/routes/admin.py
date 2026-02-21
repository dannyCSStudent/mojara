from fastapi import APIRouter, Depends
from app.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/ping")
def admin_ping(admin=Depends(require_admin)):
    return {"message": "You are an admin"}
