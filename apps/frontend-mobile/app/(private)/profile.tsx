import { View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { AppText } from "../../components/AppText";
import { useAppStore } from "../../store/useAppStore";

export default function ProfileScreen() {
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const signOut = useAppStore((s) => s.signOut);
  const subscriptions = useAppStore((s) => s.subscriptions);

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
      Alert.alert("Logout failed. Please try again.");
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
        <View className="mb-8 rounded-3xl bg-gray-100 dark:bg-neutral-800 p-6">

          <AppText
            variant="caption"
            className="mb-2 text-gray-500 dark:text-neutral-400"
          >
            Signed in as
          </AppText>

          <AppText variant="body" className="mb-4">
            {user?.email}
          </AppText>

          <View className="flex-row justify-between items-center">
            <AppText variant="caption" className="text-gray-500">
              Role
            </AppText>

            <View className="px-3 py-1 rounded-full bg-black dark:bg-white">
              <AppText className="text-white dark:text-black text-xs">
                {user?.app_role?.toUpperCase()}
              </AppText>
            </View>
          </View>
        </View>

        {/* =========================
            SETTINGS SECTION
        ========================= */}

        <View className="gap-4 mb-12">

          {/* Manage Markets */}
          <Pressable
            onPress={() =>
              router.push("/(private)/markets/manage")
            }
            className="rounded-2xl border border-gray-200 dark:border-neutral-700 p-5"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <AppText variant="subheading">
                  Manage Markets
                </AppText>

                <AppText
                  variant="caption"
                  className="mt-1 text-gray-500 dark:text-neutral-400"
                >
                  Subscribed to {subscriptions.length} market
                  {subscriptions.length === 1 ? "" : "s"}
                </AppText>
              </View>

              <AppText className="text-gray-400">{">"}</AppText>
            </View>
          </Pressable>

        </View>

        {/* =========================
            LOGOUT
        ========================= */}

        <Pressable
          onPress={handleLogout}
          className="mt-auto rounded-2xl bg-red-600 py-4 items-center"
        >
          <AppText variant="subheading" className="text-white">
            Log Out
          </AppText>
        </Pressable>

      </View>
    </Screen>
  );
}
