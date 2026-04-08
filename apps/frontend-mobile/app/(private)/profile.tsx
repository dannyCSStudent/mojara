import { View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { useAppStore } from '../../store/useAppStore';

export default function ProfileScreen() {
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const vendorId = useAppStore((s) => s.vendorId);
  const signOut = useAppStore((s) => s.signOut);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const isVendor = user?.app_role === 'vendor' && !!vendorId;
  const isAdmin = user?.app_role === 'admin';

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
      Alert.alert('Logout failed. Please try again.');
    }
  }

  return (
    <Screen>
      <View className="flex-1 px-6 pt-12">
        {/* Title */}
        <AppText variant="title" className="mb-8">
          Profile
        </AppText>

        {/* =========================
            USER CARD
        ========================= */}
        <View className="mb-8 rounded-3xl bg-gray-100 p-6 dark:bg-neutral-800">
          <AppText variant="caption" className="mb-2 text-gray-500 dark:text-neutral-400">
            Signed in as
          </AppText>

          <AppText variant="body" className="mb-4">
            {user?.email}
          </AppText>

          <View className="flex-row items-center justify-between">
            <AppText variant="caption" className="text-gray-500">
              Role
            </AppText>

            <View className="rounded-full bg-black px-3 py-1 dark:bg-white">
              <AppText className="text-xs text-white dark:text-black">
                {user?.app_role?.toUpperCase()}
              </AppText>
            </View>
          </View>
        </View>

        {/* =========================
            SETTINGS SECTION
        ========================= */}

        <View className="mb-12 gap-4">
          {/* Manage Markets */}
          <Pressable
            onPress={() => router.push('/(private)/markets/manage')}
            className="rounded-2xl border border-gray-200 p-5 dark:border-neutral-700">
            <View className="flex-row items-center justify-between">
              <View>
                <AppText variant="subheading">Manage Markets</AppText>

                <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                  Subscribed to {subscriptions.length} market
                  {subscriptions.length === 1 ? '' : 's'}
                </AppText>
              </View>

              <AppText className="text-gray-400">{'>'}</AppText>
            </View>
          </Pressable>

          {isVendor ? (
            <>
              <Pressable
                onPress={() => router.push('/(private)/vendor/products')}
                className="rounded-2xl border border-gray-200 p-5 dark:border-neutral-700">
                <View className="flex-row items-center justify-between">
                  <View>
                    <AppText variant="subheading">Manage Products</AppText>

                    <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                      Update your catalog and inventory
                    </AppText>
                  </View>

                  <AppText className="text-gray-400">{'>'}</AppText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(private)/vendor/orders')}
                className="rounded-2xl border border-gray-200 p-5 dark:border-neutral-700">
                <View className="flex-row items-center justify-between">
                  <View>
                    <AppText variant="subheading">Incoming Orders</AppText>

                    <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                      Confirm or cancel pending orders
                    </AppText>
                  </View>

                  <AppText className="text-gray-400">{'>'}</AppText>
                </View>
              </Pressable>
            </>
          ) : null}

          {isAdmin ? (
            <Pressable
              onPress={() => router.push('/(private)/(admin)/dashboard')}
              className="rounded-2xl border border-gray-200 p-5 dark:border-neutral-700">
              <View className="flex-row items-center justify-between">
                <View>
                  <AppText variant="subheading">Admin Dashboard</AppText>

                  <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                    Manage vendors, prices, and platform operations
                  </AppText>
                </View>

                <AppText className="text-gray-400">{'>'}</AppText>
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* =========================
            LOGOUT
        ========================= */}

        <Pressable
          onPress={handleLogout}
          className="mt-auto items-center rounded-2xl bg-red-600 py-4">
          <AppText variant="subheading" className="text-white">
            Log Out
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
