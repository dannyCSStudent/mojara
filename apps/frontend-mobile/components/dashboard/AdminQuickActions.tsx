import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton } from "../../components";

export function AdminQuickActions() {
  const router = useRouter();

  return (
    <View className="bg-white rounded-2xl p-4 shadow space-y-3">
      <AppText className="text-lg font-semibold">
        Quick Actions
      </AppText>

      <AppButton
        onPress={() => router.push("/(private)/markets/manage")}
      >
        Manage Markets
      </AppButton>

      <AppButton
        onPress={() => router.push("/(private)/(admin)/prices")}
        variant="secondary"
      >
        Manage Prices
      </AppButton>

      <AppButton
        onPress={() => router.push("/(private)/orders")}
        variant="ghost"
      >
        View All Orders
      </AppButton>
    </View>
  );
}
