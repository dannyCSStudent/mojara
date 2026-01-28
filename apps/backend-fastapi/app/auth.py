from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
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
        resp = httpx.get(JWKS_URL)
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

        # 🔑 IMPORTANT ADDITIONS
        payload["id"] = payload["sub"]
        payload["_jwt"] = token
        payload["app_role"] = payload.get("role", "user")

        return payload

    except JWTError as e:
        print("JWT ERROR:", e)
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


def require_role(required_role: str):
    def dependency(user=Depends(get_current_user)):
        role = user.get("app_metadata", {}).get("role")

        if role not in ROLE_LEVELS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid role",
            )

        if ROLE_LEVELS[role] < ROLE_LEVELS[required_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return user

    return dependency


def get_user_id(user: dict) -> str:
    return user["sub"]
