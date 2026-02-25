import { View } from "react-native";
import { AppText } from "../AppText";
import { clsx } from "clsx";

interface Props {
  label: string;
  value: number;
  className?: string;
}

export function AdminStatsCard({ label, value, className }: Props) {
  return (
    <View className={clsx("bg-white rounded-2xl p-4 shadow", className)}>
      <AppText className="text-gray-500">{label}</AppText>
      <AppText className="text-2xl font-bold">{value}</AppText>
    </View>
  );
}
