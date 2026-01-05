import { clsx } from "clsx";
import { Button } from "@repo/ui";
import type { ComponentProps } from "react";
import { ActivityIndicator, View } from "react-native";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";

/**
 * Take ALL Button props
 * BUT remove variant (we control it)
 */
type BaseButtonProps = Omit<
  ComponentProps<typeof Button>,
  "variant"
>;

interface AppButtonProps extends BaseButtonProps {
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

const variantStyles: Record<AppButtonVariant, string> = {
  primary: "bg-primary dark:bg-primary-dark text-white",
  secondary:
    "bg-surface dark:bg-surface-dark text-text dark:text-text-dark",
  success: "bg-accent dark:bg-accent-dark text-white",
  danger: "bg-danger dark:bg-danger-dark text-white",
  ghost: "bg-transparent text-primary dark:text-primary-dark",
};

export function AppButton({
  variant = "primary",
  loading = false,
  disabled = false,
  className,
  children,
  onPress,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      {...props}
      onPress={isDisabled ? undefined : onPress}
      className={clsx(
        "px-6 py-3 rounded-xl",
        variantStyles[variant],
        isDisabled && "opacity-60",
        className
      )}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color="white" />
        </View>
      ) : (
        children
      )}
    </Button>
  );
}
