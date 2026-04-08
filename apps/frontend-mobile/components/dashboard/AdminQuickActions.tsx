import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, AppButton } from '../../components';

export function AdminQuickActions() {
  const router = useRouter();

  return (
    <View className="space-y-3 rounded-2xl bg-white p-4 shadow">
      <AppText className="text-lg font-semibold">Quick Actions</AppText>

      <AppButton onPress={() => router.push('/(private)/markets/manage')}>Manage Markets</AppButton>

      <AppButton onPress={() => router.push('/(private)/(admin)/prices')} variant="secondary">
        Manage Prices
      </AppButton>

      <AppButton onPress={() => router.push('/(private)/(admin)/vendors')} variant="secondary">
        Manage Vendors
      </AppButton>

      <AppButton onPress={() => router.push('/(private)/(admin)/users')} variant="secondary">
        Manage Users
      </AppButton>

      <AppButton onPress={() => router.push('/(private)/orders')} variant="ghost">
        View All Orders
      </AppButton>
    </View>
  );
}
