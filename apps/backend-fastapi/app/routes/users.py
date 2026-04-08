from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import require_permissions
from app.core.permissions import ROLE_PERMISSIONS
from app.schemas.users import PaginatedUsersOut, UserOut, UserRoleUpdateIn
from app.services.user_admin import (
    SORTABLE_USER_FIELDS,
    get_user,
    list_users,
    update_user_role,
)

router = APIRouter()


@router.get("/users", response_model=PaginatedUsersOut)
def list_users_route(
    search: str | None = Query(None),
    role: str | None = Query(None),
    vendor_id: str | None = Query(None),
    sort_field: str = Query("email"),
    sort_direction: str = Query("asc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_permissions("users.read")),
):
    if role is not None and role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail="Invalid role")
    if sort_field not in SORTABLE_USER_FIELDS:
        raise HTTPException(status_code=400, detail="Invalid sort field")
    if sort_direction not in {"asc", "desc"}:
        raise HTTPException(status_code=400, detail="Invalid sort direction")

    return list_users(
        search=search,
        role=role,
        vendor_id=vendor_id,
        sort_field=sort_field,
        sort_direction=sort_direction,
        page=page,
        per_page=per_page,
    )


@router.get("/users/{user_id}", response_model=UserOut)
def get_user_route(
    user_id: str,
    current_user: dict = Depends(require_permissions("users.read")),
):
    user = get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}/role")
def change_user_role(
    user_id: str,
    payload: UserRoleUpdateIn,
    current_user: dict = Depends(require_permissions("users.write"))
):
    if payload.new_role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail="Invalid role")

    result = update_user_role(user_id, payload.new_role)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result
