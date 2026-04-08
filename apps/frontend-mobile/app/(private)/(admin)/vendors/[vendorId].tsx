import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { AppText } from '../../../../components';
import { ProductManagerScreen } from '../../../../components/products/ProductManagerScreen';
import { buildAdminVendorLinkedUsersRoute } from '../../../../utils/adminNavigation';

export default function AdminVendorProductsScreen() {
  const router = useRouter();
  const { marketId, vendorId, vendorName } = useLocalSearchParams<{
    marketId: string;
    vendorId: string;
    vendorName?: string;
  }>();

  return (
    <ProductManagerScreen
      marketId={marketId}
      vendorId={vendorId}
      title="Manage Products"
      subtitle={`${vendorName ? vendorName : 'Vendor'} in market ${marketId ?? ''}`}
      missingContextMessage="Missing market or vendor context."
      headerActions={
        vendorId ? (
          <Pressable
            onPress={() => router.push(buildAdminVendorLinkedUsersRoute(vendorId))}
            className="self-start rounded-full border border-gray-300 px-3 py-2 dark:border-gray-700">
            <AppText>Linked Users</AppText>
          </Pressable>
        ) : null
      }
    />
  );
}
