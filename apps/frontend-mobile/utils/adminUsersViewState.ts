export function buildLinkedVendorBannerTitle(vendorId: string, vendorName?: string | null) {
  return vendorName
    ? `Exact vendor filter active: ${vendorName} (${vendorId})`
    : `Exact vendor filter active: ${vendorId}`;
}

export function buildLinkedVendorSummary(usersCount: number, page: number, hasMore: boolean) {
  return `Showing ${usersCount} linked user${usersCount === 1 ? '' : 's'} on page ${page}${hasMore ? ' with more available.' : '.'}`;
}

export function buildAdminUsersEmptyState(params: {
  vendorId?: string;
  vendorName?: string | null;
  roleFilter: 'all' | 'user' | 'vendor' | 'moderator' | 'admin';
}) {
  const rolePrefix = params.roleFilter === 'all' ? '' : `${params.roleFilter} `;

  if (params.vendorId) {
    return {
      title: 'No linked users',
      description: params.vendorName
        ? `No ${rolePrefix}users are linked to ${params.vendorName}.`
        : `No ${rolePrefix}users are linked to this vendor.`,
    };
  }

  return {
    title: 'No users found',
    description:
      params.roleFilter === 'all'
        ? 'Try a different search term.'
        : `No ${params.roleFilter} users match this search on this page.`,
  };
}
