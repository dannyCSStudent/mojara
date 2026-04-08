# app/core/permissions.py
import json
from pathlib import Path
from typing import Dict, List, TypedDict


class PermissionRegistry(TypedDict):
    roles: Dict[str, List[str]]
    permissions: List[str]
    routePermissions: Dict[str, str]


def _load_permission_registry() -> PermissionRegistry:
    registry_path = (
        Path(__file__).resolve().parents[4]
        / "packages"
        / "types"
        / "permissions-registry.json"
    )

    try:
        with open(registry_path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"Permissions registry not found at {registry_path}. "
            "Make sure permissions-registry.json exists in packages/types."
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError("Permissions registry JSON is malformed.") from exc


_registry = _load_permission_registry()

ROLE_PERMISSIONS: Dict[str, List[str]] = {
    role: permissions for role, permissions in _registry["roles"].items()
}

