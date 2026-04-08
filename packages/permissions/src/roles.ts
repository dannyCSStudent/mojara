import { AppRole, Permission, permissionRegistry } from "@repo/types";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> =
  permissionRegistry.roles as Record<AppRole, Permission[]>;
