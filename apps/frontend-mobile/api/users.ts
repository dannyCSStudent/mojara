import { apiRequest } from './client';

export type AdminUser = {
  id: string;
  email: string | null;
  role: 'admin' | 'moderator' | 'vendor' | 'user';
  vendor_id: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
};

export type PaginatedAdminUsers = {
  items: AdminUser[];
  page: number;
  per_page: number;
  has_more: boolean;
};

export type AdminUserSortField = 'email' | 'created_at' | 'last_sign_in_at' | 'role' | 'id';

export type AdminUserSortDirection = 'asc' | 'desc';

export function fetchUsers(
  options: {
    search?: string;
    role?: AdminUser['role'];
    vendorId?: string;
    sortField?: AdminUserSortField;
    sortDirection?: AdminUserSortDirection;
    page?: number;
    perPage?: number;
  } = {}
) {
  const query = new URLSearchParams();
  if (options.search?.trim()) {
    query.set('search', options.search.trim());
  }
  if (options.role) {
    query.set('role', options.role);
  }
  if (options.vendorId) {
    query.set('vendor_id', options.vendorId);
  }
  if (options.sortField) {
    query.set('sort_field', options.sortField);
  }
  if (options.sortDirection) {
    query.set('sort_direction', options.sortDirection);
  }
  if (options.page) {
    query.set('page', String(options.page));
  }
  if (options.perPage) {
    query.set('per_page', String(options.perPage));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<PaginatedAdminUsers>(`/users${suffix}`);
}

export function fetchUser(userId: string) {
  return apiRequest<AdminUser>(`/users/${userId}`);
}

export function updateUserRole(userId: string, newRole: AdminUser['role']) {
  return apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: { new_role: newRole },
  });
}
