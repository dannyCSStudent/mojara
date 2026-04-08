import { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Screen, LoadingState, EmptyState } from '../../../components';
import { useAdminDashboard } from '../../../hooks/useDashboard';
import { AdminStatsCard } from '../../../components/dashboard/AdminStatsCard';
import { AdminQuickActions } from '../../../components/dashboard/AdminQuickActions';
import { AdminPendingOrders } from '../../../components/dashboard/AdminPendingOrders';

export default function AdminDashboardScreen() {
  const { data, loading, error, reload } = useAdminDashboard();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  // First load spinner
  if (loading && !data) return <LoadingState />;
  if (error && !data) return <EmptyState title="Error" description={error} />;
  if (!data) return <EmptyState title="No data" />;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="space-y-6">
          {/* Stats */}
          <View className="flex-row flex-wrap gap-4">
            <AdminStatsCard
              label="Total Orders (7d)"
              value={data.total_orders_7d}
              className="w-[48%]"
            />
            <AdminStatsCard label="Orders Today" value={data.orders_today} className="w-[48%]" />
            <AdminStatsCard
              label="Active Vendors"
              value={data.active_vendors}
              className="w-[48%]"
            />
            <AdminStatsCard
              label="Pending Orders"
              value={data.pending_orders}
              className="w-[48%]"
            />
          </View>

          {/* Realtime Pending */}
          <AdminPendingOrders />

          {/* Quick Actions */}
          <AdminQuickActions />
        </View>
      </ScrollView>
    </Screen>
  );
}
