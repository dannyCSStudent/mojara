import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText, LoadingState, Screen } from '../../../../components';
import { AdminVendorContextActions } from '../../../../components/admin/AdminVendorContextActions';
import { AdminUserRoleChips } from '../../../../components/admin/AdminUserRoleChips';
import { AdminUser, fetchUser, updateUserRole } from '../../../../api/users';
import { fetchVendor, Vendor } from '../../../../api/vendors';

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

export default function AdminUserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<AdminUser['role'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!userId) {
        setError('Missing user id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const nextUser = await fetchUser(userId);
        if (mounted) {
          setUser(nextUser);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message ?? 'Failed to load user.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    async function loadVendor() {
      if (!user?.vendor_id) {
        setVendor(null);
        return;
      }

      try {
        const nextVendor = await fetchVendor(user.vendor_id);
        if (mounted) {
          setVendor(nextVendor);
        }
      } catch {
        if (mounted) {
          setVendor(null);
        }
      }
    }

    void loadVendor();

    return () => {
      mounted = false;
    };
  }, [user?.vendor_id]);

  async function handleRoleChange(newRole: AdminUser['role']) {
    if (!userId || !user) {
      return;
    }

    try {
      setSavingRole(newRole);
      setError(null);
      setSuccessMessage(null);
      await updateUserRole(userId, newRole);
      setUser({ ...user, role: newRole });
      setSuccessMessage(`${user.email ?? user.id} is now ${newRole}.`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update user role.');
      setSuccessMessage(null);
    } finally {
      setSavingRole(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <Screen scroll className="pt-6">
        <View className="gap-4 pb-10">
          <AppText variant="headline">User Details</AppText>
          <AppText variant="caption">{error ?? 'User not found.'}</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll className="pt-6">
      <View className="gap-4 pb-10">
        <View className="gap-2">
          <AppText variant="headline">{user.email ?? 'No email'}</AppText>
          <AppText variant="caption">User detail and role management.</AppText>
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

        <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <AppText variant="subheading">Profile</AppText>
          <AppText variant="caption" className="mt-2">
            ID: {user.id}
          </AppText>
          <AppText variant="caption">Role: {user.role}</AppText>
          <AppText variant="caption">
            Vendor: {user.vendor_id ? user.vendor_id.slice(0, 8) : 'none'}
          </AppText>
          <AppText variant="caption">Created: {formatDateTime(user.created_at)}</AppText>
          <AppText variant="caption">Last sign-in: {formatDateTime(user.last_sign_in_at)}</AppText>
        </View>

        {user.vendor_id ? (
          <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <AppText variant="subheading">Vendor Context</AppText>
            <AppText variant="caption" className="mt-2">
              Vendor name: {vendor?.name ?? 'Unavailable'}
            </AppText>
            <AppText variant="caption">Market: {vendor?.market_id ?? 'Unknown'}</AppText>
            <AppText variant="caption">Vendor id: {user.vendor_id}</AppText>

            {vendor ? (
              <View className="mt-3">
                <AdminVendorContextActions vendor={vendor} />
              </View>
            ) : null}
          </View>
        ) : null}

        <View className="gap-2">
          <AppText variant="subheading">Change Role</AppText>
          <AdminUserRoleChips
            activeRole={user.role}
            disabled={savingRole !== null}
            pendingRole={savingRole}
            onSelectRole={(role) => void handleRoleChange(role)}
          />
        </View>
      </View>
    </Screen>
  );
}
