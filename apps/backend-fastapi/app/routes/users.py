from fastapi import APIRouter, Depends
from app.core.dependencies import require_permissions
from app.services.user_admin import update_user_role

router = APIRouter()

@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    new_role: str,
    current_user: dict = Depends(require_permissions("users.write"))
):
    return update_user_role(user_id, new_role)
