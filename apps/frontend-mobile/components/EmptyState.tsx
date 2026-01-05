import { View } from "react-native";
import { AppText } from "./AppText";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-6">
      <AppText variant="headline" className="text-center">
        {title}
      </AppText>

      {description && (
        <AppText variant="body" className="text-center">
          {description}
        </AppText>
      )}

      {action}
    </View>
  );
}
