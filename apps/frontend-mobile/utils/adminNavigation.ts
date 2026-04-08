import type { AdminUser } from '../api/users';
import type { Vendor } from '../api/vendors';

type AdminUsersRouteParams = {
  role?: AdminUser['role'];
  search?: string;
  vendorId?: string;
};

export function buildAdminUsersRoute(params: AdminUsersRouteParams = {}) {
  return {
    pathname: '/(private)/(admin)/users' as const,
    params,
  };
}

export function buildAdminVendorLinkedUsersRoute(vendorId: string) {
  return buildAdminUsersRoute({
    vendorId,
    role: 'vendor',
  });
}

export function buildAdminUserDetailRoute(userId: string) {
  return {
    pathname: '/(private)/(admin)/users/[userId]' as const,
    params: {
      userId,
    },
  };
}

export function buildAdminVendorProductsRoute(vendor: Pick<Vendor, 'id' | 'market_id' | 'name'>) {
  return {
    pathname: '/(private)/(admin)/vendors/[vendorId]' as const,
    params: {
      marketId: vendor.market_id,
      vendorId: vendor.id,
      vendorName: vendor.name,
    },
  };
}
