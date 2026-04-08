import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Vendor } from '../../api/vendors';
import {
  buildAdminVendorLinkedUsersRoute,
  buildAdminVendorProductsRoute,
} from '../../utils/adminNavigation';
import { AppText } from '../AppText';

type AdminVendorContextActionsProps = {
  vendor: Vendor;
};

export function AdminVendorContextActions({ vendor }: AdminVendorContextActionsProps) {
  const router = useRouter();

  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={() => router.push(buildAdminVendorLinkedUsersRoute(vendor.id))}
        className="self-start rounded-full border border-gray-300 px-3 py-2 dark:border-gray-700">
        <AppText>View Related Users</AppText>
      </Pressable>
      <Pressable
        onPress={() => router.push(buildAdminVendorProductsRoute(vendor))}
        className="self-start rounded-full border border-gray-300 px-3 py-2 dark:border-gray-700">
        <AppText>Open Vendor Products</AppText>
      </Pressable>
    </View>
  );
}
