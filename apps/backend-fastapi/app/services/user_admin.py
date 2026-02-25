from app.db import get_service_client


def update_user_role(user_id: str, new_role: str):
    """
    Updates role inside Supabase auth app_metadata.
    Requires service role key.
    """

    supabase = get_service_client()

    response = supabase.auth.admin.update_user_by_id(
        user_id,
        {
            "app_metadata": {
                "role": new_role
            }
        }
    )

    return response
