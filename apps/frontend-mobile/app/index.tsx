import { Screen, AppText, AppButton } from "../components";

export default function Home() {
  return (
    <Screen className="items-center justify-center gap-6">
      <AppText variant="title">
        Mojara 🐟
      </AppText>

      <AppText variant="subheading" className="text-center">
        Fresh markets. Direct deals.
      </AppText>

      <AppButton variant="primary">
        Get Started
      </AppButton>
    </Screen>
  );
}
