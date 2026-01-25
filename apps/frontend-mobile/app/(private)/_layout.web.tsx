import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <Icon sf="cart.fill" />
        <Label>Orders</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
