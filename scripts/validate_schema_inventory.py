from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "supabase" / "schema-inventory.md"
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"


def _extract_inventory_section(markdown: str, heading: str) -> list[str]:
    pattern = rf"^## {re.escape(heading)}\n(.*?)(?=^## |\Z)"
    match = re.search(pattern, markdown, flags=re.MULTILINE | re.DOTALL)
    if not match:
        return []

    section = match.group(1)
    return re.findall(r"- `([^`]+)`", section)


def _load_inventory() -> dict[str, list[str]]:
    markdown = INVENTORY_PATH.read_text()
    return {
        "tables": _extract_inventory_section(markdown, "Tables"),
        "views": _extract_inventory_section(markdown, "Views"),
        "functions": _extract_inventory_section(markdown, "RPC / SQL functions"),
        "channels": _extract_inventory_section(markdown, "Realtime / LISTEN channels"),
    }


def _load_sql() -> str:
    sql_parts = []
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        sql_parts.append(path.read_text())
    return "\n".join(sql_parts).lower()


def validate_schema_inventory() -> list[str]:
    inventory = _load_inventory()
    sql = _load_sql()
    errors: list[str] = []

    for table in inventory["tables"]:
        token = f"create table if not exists public.{table}".lower()
        if token not in sql:
            errors.append(f"Missing table definition for `{table}`")

    for view in inventory["views"]:
        token = f"create or replace view public.{view}".lower()
        if token not in sql:
            errors.append(f"Missing view definition for `{view}`")

    for function in inventory["functions"]:
        token = f"create or replace function public.{function}".lower()
        if token not in sql:
            errors.append(f"Missing function definition for `{function}`")

    for channel in inventory["channels"]:
        if channel.lower() not in sql:
            errors.append(f"Missing channel reference for `{channel}`")

    return errors


def main() -> int:
    errors = validate_schema_inventory()
    if errors:
        for error in errors:
            print(error)
        return 1

    print("Schema inventory validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
