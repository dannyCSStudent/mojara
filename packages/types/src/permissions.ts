import permissionRegistryJson from "../permissions-registry.json";

const rawPermissionRegistry = permissionRegistryJson as {
  readonly roles: Record<string, readonly string[]>;
  readonly permissions: readonly string[];
  readonly routePermissions: Record<string, string>;
};

export type AppRole = keyof typeof rawPermissionRegistry.roles;
export type Permission = (typeof rawPermissionRegistry.permissions)[number];

export const permissionRegistry = {
  roles: rawPermissionRegistry.roles as Record<AppRole, readonly Permission[]>,
  permissions: rawPermissionRegistry.permissions as readonly Permission[],
  routePermissions: rawPermissionRegistry.routePermissions as Record<string, Permission>,
} as const;
