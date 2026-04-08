from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PERMISSION_REGISTRY = ROOT / "packages" / "types" / "permissions-registry.json"
ROUTES_DIR = ROOT / "apps" / "backend-fastapi" / "app" / "routes"


def _load_permission_registry() -> dict[str, object]:
    with open(PERMISSION_REGISTRY, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _load_declared_permissions() -> set[str]:
    registry = _load_permission_registry()
    permissions = registry.get("permissions", [])
    if not isinstance(permissions, list):
        return set()
    return {permission for permission in permissions if isinstance(permission, str)}


def _load_role_permissions() -> dict[str, set[str]]:
    registry = _load_permission_registry()
    roles = registry.get("roles", {})
    if not isinstance(roles, dict):
        return {}

    normalized: dict[str, set[str]] = {}
    for role, permissions in roles.items():
        if not isinstance(role, str) or not isinstance(permissions, list):
            continue
        normalized[role] = {
            permission for permission in permissions if isinstance(permission, str)
        }
    return normalized


def _load_route_permissions() -> set[str]:
    permissions: set[str] = set()
    pattern = re.compile(
        r"require_(?:any_)?permissions\(([^)]*)\)",
        flags=re.MULTILINE,
    )

    for path in ROUTES_DIR.glob("*.py"):
        source = path.read_text()
        for match in pattern.finditer(source):
            args = match.group(1)
            permissions.update(re.findall(r'"([^"]+)"', args))

    return permissions


def validate_permissions_inventory() -> list[str]:
    declared_permissions = _load_declared_permissions()
    role_permissions = _load_role_permissions()
    route_permissions = _load_route_permissions()

    errors: list[str] = []

    for permission in sorted(route_permissions):
        if permission not in declared_permissions and permission != "*":
            errors.append(f"Route permission `{permission}` missing from shared registry")

    for role, permissions in sorted(role_permissions.items()):
        for permission in sorted(permissions):
            if permission not in declared_permissions and permission != "*":
                errors.append(
                    f"Role `{role}` references undeclared permission `{permission}`"
                )

    return errors


def main() -> int:
    errors = validate_permissions_inventory()
    if errors:
        for error in errors:
            print(error)
        return 1

    print("Permission inventory validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
