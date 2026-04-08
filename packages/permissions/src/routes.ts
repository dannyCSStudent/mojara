import { Permission, permissionRegistry } from "@repo/types";

export const ROUTE_PERMISSIONS: Record<string, Permission> =
  permissionRegistry.routePermissions;
