import { View } from 'react-native';
import { AppText } from './AppText';

interface AppHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ title, rightSlot }: AppHeaderProps) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <AppText variant="headline">{title}</AppText>

      {rightSlot}
    </View>
  );
}
