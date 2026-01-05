import { View } from "react-native";
import { AppText } from "./AppText";

interface AppHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ title, rightSlot }: AppHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <AppText variant="headline">
        {title}
      </AppText>

      {rightSlot}
    </View>
  );
}
