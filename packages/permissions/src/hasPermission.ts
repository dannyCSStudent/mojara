import { ROLE_PERMISSIONS } from "./roles";
import { AppRole, Permission } from "@repo/types";

export function hasPermission(
  role: AppRole,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Global wildcard
  if (permissions.includes("*")) return true;

  // Exact match
  if (permissions.includes(permission)) return true;

  // Resource wildcard
  return permissions.some((p) => {
    if (p.endsWith(".*")) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix);
    }
    return false;
  });
}
