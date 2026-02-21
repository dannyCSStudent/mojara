from app.db import get_service_client


def promote_to_admin(user_id: str):
    """
    Promotes a user to admin by writing role to app_metadata.
    Must ONLY be called from trusted backend logic.
    """
    supabase = get_service_client()

    return supabase.auth.admin.update_user_by_id(
        user_id,
        {
            "app_metadata": {
                "role": "admin"
            }
        }
    )
