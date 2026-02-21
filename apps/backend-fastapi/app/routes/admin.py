from fastapi import APIRouter, Depends
from app.core.dependencies import require_permissions, require_any_permission
router = APIRouter(prefix="/admin", tags=["Admin"])



@router.get("/ping")
def admin_ping(user=Depends(require_permissions(["users.read"]))):
    return {"message": "You have users.read permission"}


# @router.post("/users")
# def create_user(
#     user=Depends(require_permissions(["users.read", "users.write"]))
# ):
