import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { clsx } from "clsx";

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  scroll?: boolean;
}

export function Screen({
  children,
  className,
  header,
  scroll = false,
}: ScreenProps) {
  const Wrapper = scroll ? ScrollView : SafeAreaView;

  return (
    <Wrapper
      className={clsx(
        "flex-1 bg-background dark:bg-background-dark px-4",
        className
      )}
      contentContainerStyle={scroll ? { paddingBottom: 24 } : undefined}
    >
      {header}
      {children}
    </Wrapper>
  );
}
