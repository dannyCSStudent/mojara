import { Text, TextProps } from "react-native";
import { clsx } from "clsx";

type AppTextVariant =
  | "title"
  | "headline"
  | "subheading"
  | "body"
  | "caption"
  | "muted";

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
}

const variantStyles: Record<AppTextVariant, string> = {
  title: "text-4xl font-extrabold text-black dark:text-white",
  headline: "text-2xl font-bold text-black dark:text-white",
  subheading: "text-lg font-semibold text-gray-800 dark:text-gray-200",
  body: "text-base text-gray-700 dark:text-gray-300",
  caption: "text-sm text-gray-500 dark:text-gray-400",
  muted: "text-sm text-gray-400 dark:text-gray-500",
};

export function AppText({
  variant = "body",
  className,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      className={clsx(variantStyles[variant], className)}
    />
  );
}
