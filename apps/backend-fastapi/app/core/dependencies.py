from fastapi import Depends, HTTPException, status
from typing import List, Union
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from app.core.permissions import ROLE_PERMISSIONS
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ISSUER = f"{SUPABASE_URL}/auth/v1"

JWKS_URL = f"{SUPABASE_ISSUER}/.well-known/jwks.json"

security = HTTPBearer()

_jwks_cache = None


def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        resp = httpx.get(JWKS_URL, timeout=5.0)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
):
    token = creds.credentials

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        jwks = get_jwks()
        key = next(
            (k for k in jwks["keys"] if k["kid"] == kid),
            None,
        )

        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token key",
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience="authenticated",
            issuer=SUPABASE_ISSUER,
        )

        # --------------------------------------------------
        # 🔐 STRICT ROLE EXTRACTION + VALIDATION
        # --------------------------------------------------

        role = payload.get("app_metadata", {}).get("role", "user")

        if role not in ROLE_PERMISSIONS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid role",
            )

        # --------------------------------------------------
        # 🔐 Extract Vendor ID (if present)
        # --------------------------------------------------

        vendor_id = payload.get("app_metadata", {}).get("vendor_id")

        # --------------------------------------------------
        # Attach normalized fields
        # --------------------------------------------------

        payload["id"] = payload["sub"]
        payload["_jwt"] = token
        payload["app_role"] = role
        payload["vendor_id"] = vendor_id  # 🚀 new

        return payload


    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

ROLE_LEVELS = {
    "user": 1,
    "admin": 2,
}

def get_current_jwt(
    user: dict = Depends(get_current_user),
) -> str:
    """
    Returns the raw JWT for Supabase RLS calls
    """
    return user["_jwt"]


def get_user_id(user: dict) -> str:
    return user["sub"]

def require_permissions(required_permissions: Union[List[str], str]):
    if isinstance(required_permissions, str):
        required_permissions = [required_permissions]

    def permission_checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("app_role", "user")
        user_permissions = ROLE_PERMISSIONS.get(role, [])

        missing_permissions = [
            perm for perm in required_permissions
            if not has_permission(user_permissions, perm)
        ]

        if missing_permissions:
            raise HTTPException(
                status_code=403,
                detail=f"Missing permissions: {missing_permissions}",
            )

        return current_user

    return permission_checker




def require_any_permission(required_permissions: Union[List[str], str]):
    if isinstance(required_permissions, str):
        required_permissions = [required_permissions]

    def permission_checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("app_role", "user")
        user_permissions = ROLE_PERMISSIONS.get(role, [])

        if not any(has_permission(user_permissions, perm) for perm in required_permissions):
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions",
            )

        return current_user

    return permission_checker



def has_permission(user_permissions: list[str], required_permission: str) -> bool:
    """
    Checks:
    - Global wildcard (*.*)
    - Exact match
    - Resource wildcard (e.g., users.*)
    """

    # 🔥 Global wildcard
    if "*" in user_permissions:
        return True

    # Exact match
    if required_permission in user_permissions:
        return True

    # Resource wildcard
    for perm in user_permissions:
        if perm.endswith(".*"):
            prefix = perm[:-2]
            if required_permission.startswith(prefix):
                return True

    return False
