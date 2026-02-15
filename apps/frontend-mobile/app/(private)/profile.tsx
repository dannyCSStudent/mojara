import { View, Pressable, Alert } from "react-native";
import { Screen } from "../../components/Screen";
import { AppText } from "../../components/AppText";
import { useAppStore } from "../../store/useAppStore";

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const signOut = useAppStore((s) => s.signOut);

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
      <View className="flex-1 px-6 pt-10">
        <AppText variant="title" className="mb-6">
          Profile
        </AppText>

        {/* User Info */}
        <View className="mb-10 rounded-2xl bg-gray-100 dark:bg-neutral-800 p-6">
          <AppText variant="caption" className="mb-2 text-gray-500">
            Email
          </AppText>

          <AppText variant="body">
            {user?.email}
          </AppText>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="rounded-2xl bg-red-600 py-4 items-center"
        >
          <AppText variant="subheading" className="text-white">
            Log Out
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
