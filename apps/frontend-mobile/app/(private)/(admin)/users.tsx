import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { AppText, EmptyState, LoadingState, Screen } from '../../../components';
import { AdminVendorContextActions } from '../../../components/admin/AdminVendorContextActions';
import { AdminUserRoleChips } from '../../../components/admin/AdminUserRoleChips';
import { fetchVendor, Vendor } from '../../../api/vendors';
import { buildAdminUserDetailRoute, buildAdminUsersRoute } from '../../../utils/adminNavigation';
import {
  buildAdminUsersEmptyState,
  buildLinkedVendorBannerTitle,
  buildLinkedVendorSummary,
} from '../../../utils/adminUsersViewState';
import {
  AdminUser,
  AdminUserSortDirection,
  AdminUserSortField,
  fetchUsers,
  updateUserRole,
} from '../../../api/users';

const SORT_FIELDS: { label: string; value: AdminUserSortField }[] = [
  { label: 'Email', value: 'email' },
  { label: 'Created', value: 'created_at' },
  { label: 'Last Sign-In', value: 'last_sign_in_at' },
  { label: 'Role', value: 'role' },
  { label: 'ID', value: 'id' },
];

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    search?: string;
    role?: AdminUser['role'];
    vendorId?: string;
  }>();
  const initialSearch = params.search?.trim() ?? '';
  const PAGE_SIZE = 50;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState<AdminUser['role'] | 'all'>(params.role ?? 'all');
  const [sortField, setSortField] = useState<AdminUserSortField>('email');
  const [sortDirection, setSortDirection] = useState<AdminUserSortDirection>('asc');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<AdminUser['role'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [linkedVendor, setLinkedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const nextSearch = params.search?.trim() ?? '';
    setSearch(nextSearch);
    setDebouncedSearch(nextSearch);
    setRoleFilter(params.role ?? 'all');
    setSuccessMessage(null);
  }, [params.role, params.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let mounted = true;

    async function loadLinkedVendor() {
      if (!params.vendorId) {
        setLinkedVendor(null);
        return;
      }

      try {
        const vendor = await fetchVendor(params.vendorId);
        if (mounted) {
          setLinkedVendor(vendor);
        }
      } catch {
        if (mounted) {
          setLinkedVendor(null);
        }
      }
    }

    void loadLinkedVendor();

    return () => {
      mounted = false;
    };
  }, [params.vendorId]);

  const loadUsers = useCallback(
    async (nextPage = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const data = await fetchUsers({
          search: debouncedSearch || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
          vendorId: params.vendorId,
          sortField,
          sortDirection,
          page: nextPage,
          perPage: PAGE_SIZE,
        });
        setUsers((current) => (append ? [...current, ...data.items] : data.items));
        setPage(data.page);
        setHasMore(data.has_more);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load users.');
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [debouncedSearch, params.vendorId, roleFilter, sortField, sortDirection]
  );

  useEffect(() => {
    void loadUsers(1, false);
  }, [loadUsers]);

  async function handleRoleChange(userId: string, newRole: AdminUser['role']) {
    try {
      setSavingUserId(userId);
      setPendingRole(newRole);
      setError(null);
      setSuccessMessage(null);
      await updateUserRole(userId, newRole);
      const targetUser = users.find((user) => user.id === userId);
      setUsers((current) =>
        current
          .map((user) => (user.id === userId ? { ...user, role: newRole } : user))
          .filter((user) => (roleFilter === 'all' ? true : user.role === roleFilter))
      );
      const identifier = targetUser?.email ?? userId;
      if (roleFilter !== 'all' && roleFilter !== newRole) {
        setSuccessMessage(
          `${identifier} is now ${newRole} and no longer appears in the ${roleFilter} filter.`
        );
      } else {
        setSuccessMessage(`${identifier} is now ${newRole}.`);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to update user role.');
      setSuccessMessage(null);
    } finally {
      setSavingUserId(null);
      setPendingRole(null);
    }
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return;
    }

    await loadUsers(page + 1, true);
  }

  function clearVendorFilter() {
    setSearch('');
    setSuccessMessage(null);
    setError(null);
    router.replace(buildAdminUsersRoute(roleFilter === 'all' ? {} : { role: roleFilter }));
  }

  if (loading) {
    return <LoadingState />;
  }

  const emptyState = buildAdminUsersEmptyState({
    vendorId: params.vendorId,
    vendorName: linkedVendor?.name,
    roleFilter,
  });

  return (
    <Screen scroll className="pt-6">
      <View className="gap-4 pb-10">
        <View className="gap-2">
          <AppText variant="headline">Admin Users</AppText>
          <AppText variant="caption">Search users and update their application role.</AppText>
        </View>

        <View className="rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700">
          <TextInput
            placeholder="Search by email, id, role, or vendor id..."
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              if (successMessage) {
                setSuccessMessage(null);
              }
            }}
            autoCapitalize="none"
            editable={!params.vendorId}
          />
        </View>

        {params.vendorId ? (
          <View className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <AppText variant="caption" className="text-blue-700 dark:text-blue-300">
              {buildLinkedVendorBannerTitle(params.vendorId, linkedVendor?.name)}
            </AppText>
            {linkedVendor ? (
              <AppText variant="caption" className="mt-1 text-blue-700 dark:text-blue-300">
                Market: {linkedVendor.market_id}
              </AppText>
            ) : null}
            <AppText variant="caption" className="mt-1 text-blue-700 dark:text-blue-300">
              {buildLinkedVendorSummary(users.length, page, hasMore)}
            </AppText>
            <View className="mt-2 flex-row gap-2">
              {linkedVendor ? <AdminVendorContextActions vendor={linkedVendor} /> : null}
              <Pressable
                onPress={() => void loadUsers(1, false)}
                className="self-start rounded-full border border-blue-300 px-3 py-2 dark:border-blue-800">
                <AppText variant="caption" className="text-blue-700 dark:text-blue-300">
                  Refresh
                </AppText>
              </Pressable>
              <Pressable
                onPress={clearVendorFilter}
                className="self-start rounded-full border border-blue-300 px-3 py-2 dark:border-blue-800">
                <AppText variant="caption" className="text-blue-700 dark:text-blue-300">
                  Clear Vendor Filter
                </AppText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
          {(['all', 'user', 'vendor', 'moderator', 'admin'] as const).map((role) => {
            const active = roleFilter === role;
            return (
              <Pressable
                key={role}
                onPress={() => setRoleFilter(role)}
                className={`rounded-full border px-3 py-2 ${
                  active
                    ? 'border-black bg-black dark:border-white dark:bg-white'
                    : 'border-gray-300 dark:border-gray-700'
                }`}>
                <AppText className={active ? 'text-white dark:text-black' : ''}>
                  {role === 'all' ? 'All Roles' : role}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="gap-2">
          <AppText variant="caption">Sort By</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
            {SORT_FIELDS.map((option) => {
              const active = sortField === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSortField(option.value)}
                  className={`rounded-full border px-3 py-2 ${
                    active
                      ? 'border-black bg-black dark:border-white dark:bg-white'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}>
                  <AppText className={active ? 'text-white dark:text-black' : ''}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            className="self-start rounded-full border border-gray-300 px-3 py-2 dark:border-gray-700">
            <AppText>Direction: {sortDirection === 'asc' ? 'Ascending' : 'Descending'}</AppText>
          </Pressable>
        </View>

        {error ? (
          <View className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <AppText variant="caption" className="text-red-700 dark:text-red-300">
              {error}
            </AppText>
          </View>
        ) : null}

        {successMessage ? (
          <View className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
            <AppText variant="caption" className="text-green-700 dark:text-green-300">
              {successMessage}
            </AppText>
          </View>
        ) : null}

        {users.length === 0 ? (
          <EmptyState title={emptyState.title} description={emptyState.description} />
        ) : (
          <>
            {users.map((user) => (
              <View
                key={user.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <AppText variant="subheading">{user.email ?? 'No email'}</AppText>
                <AppText variant="caption" className="mt-1">
                  ID: {user.id}
                </AppText>
                <AppText variant="caption">
                  Vendor: {user.vendor_id ? user.vendor_id.slice(0, 8) : 'none'}
                </AppText>
                <AppText variant="caption">Role: {user.role}</AppText>
                <AppText variant="caption">Created: {formatDateTime(user.created_at)}</AppText>
                <AppText variant="caption">
                  Last sign-in: {formatDateTime(user.last_sign_in_at)}
                </AppText>

                <Pressable
                  onPress={() => router.push(buildAdminUserDetailRoute(user.id))}
                  className="mt-3 self-start rounded-full border border-gray-300 px-3 py-2 dark:border-gray-700">
                  <AppText>View Details</AppText>
                </Pressable>

                <View className="mt-3">
                  <AdminUserRoleChips
                    activeRole={user.role}
                    disabled={savingUserId === user.id}
                    pendingRole={savingUserId === user.id ? pendingRole : null}
                    onSelectRole={(role) => void handleRoleChange(user.id, role)}
                  />
                </View>
              </View>
            ))}

            {hasMore ? (
              <Pressable
                disabled={loadingMore}
                onPress={() => void handleLoadMore()}
                className={`rounded-xl px-4 py-3 ${
                  loadingMore ? 'bg-gray-300 dark:bg-gray-700' : 'bg-black dark:bg-white'
                }`}>
                <AppText
                  className={`text-center font-semibold ${
                    loadingMore ? 'text-gray-600 dark:text-gray-300' : 'text-white dark:text-black'
                  }`}>
                  {loadingMore ? 'Loading more...' : 'Load More Users'}
                </AppText>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
