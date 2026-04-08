from app.db import get_service_client

SORTABLE_USER_FIELDS = {
    "email",
    "created_at",
    "last_sign_in_at",
    "role",
    "id",
}

MAX_LIST_USERS_PAGES = 20


def _user_sort_key(user: dict, sort_field: str):
    value = user.get(sort_field)
    if value is None:
        return (1, "")
    if isinstance(value, str):
        return (0, value.lower())
    return (0, value)


def _normalize_user(user: dict | object):
    user_obj = user if isinstance(user, dict) else getattr(user, "__dict__", {})
    app_metadata = user_obj.get("app_metadata") or {}
    email = user_obj.get("email")
    role = app_metadata.get("role", "user")
    vendor_id = app_metadata.get("vendor_id")

    return {
        "id": user_obj.get("id"),
        "email": email,
        "role": role,
        "vendor_id": vendor_id,
        "created_at": user_obj.get("created_at"),
        "last_sign_in_at": user_obj.get("last_sign_in_at"),
    }


def _extract_list_users_response(response):
    users = getattr(response, "users", None)
    if users is None and isinstance(response, dict):
        users = response.get("users") or response.get("data", {}).get("users")
    if users is None:
        users = getattr(response, "data", None) or []
    return users


def _extract_get_user_response(response):
    user = getattr(response, "user", None)
    if user is None and isinstance(response, dict):
        user = response.get("user") or response.get("data", {}).get("user")
    if user is None:
        user = getattr(response, "data", None)
    return user


def _matches_user_filters(
    user: dict,
    query: str | None = None,
    role_filter: str | None = None,
    vendor_filter: str | None = None,
):
    if role_filter and user["role"] != role_filter:
        return False
    if vendor_filter and user["vendor_id"] != vendor_filter:
        return False

    if query:
        haystack = " ".join(
            filter(
                None,
                [
                    user["id"],
                    user["email"],
                    user["role"],
                    user["vendor_id"],
                ],
            )
        ).lower()
        if query not in haystack:
            return False

    return True


def list_users(
    search: str | None = None,
    role: str | None = None,
    vendor_id: str | None = None,
    sort_field: str = "email",
    sort_direction: str = "asc",
    page: int = 1,
    per_page: int = 50,
):
    supabase = get_service_client()
    query = search.strip().lower() if search else None
    role_filter = role.strip().lower() if role else None
    vendor_filter = vendor_id.strip() if vendor_id else None
    normalized = []

    current_page = 1
    while current_page <= MAX_LIST_USERS_PAGES:
        response = supabase.auth.admin.list_users(page=current_page, per_page=per_page)
        users = _extract_list_users_response(response)

        for user in users or []:
            normalized_user = _normalize_user(user)
            if not _matches_user_filters(
                normalized_user,
                query=query,
                role_filter=role_filter,
                vendor_filter=vendor_filter,
            ):
                continue

            normalized.append(normalized_user)

        if len(users or []) < per_page:
            break

        current_page += 1

    normalized.sort(
        key=lambda user: _user_sort_key(user, sort_field),
        reverse=sort_direction == "desc",
    )

    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    page_items = normalized[start_index:end_index]

    return {
        "items": page_items,
        "page": page,
        "per_page": per_page,
        "has_more": end_index < len(normalized),
    }


def get_user(user_id: str):
    supabase = get_service_client()
    response = supabase.auth.admin.get_user_by_id(user_id)
    user = _extract_get_user_response(response)

    if not user:
        return None

    return _normalize_user(user)


def update_user_role(user_id: str, new_role: str):
    """
    Updates role inside Supabase auth app_metadata.
    Requires service role key.
    """

    supabase = get_service_client()
    existing_user = get_user(user_id)
    if not existing_user:
        return None

    app_metadata = {
        "role": new_role,
    }
    if existing_user["vendor_id"]:
        app_metadata["vendor_id"] = existing_user["vendor_id"]

    response = supabase.auth.admin.update_user_by_id(
        user_id,
        {
            "app_metadata": app_metadata
        }
    )

    return response
