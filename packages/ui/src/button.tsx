import { Pressable, Text } from 'react-native'
import { ReactNode } from 'react'
import { cssInterop } from 'nativewind'

type ButtonVariant = 'primary' | 'buy' | 'sell'

cssInterop(Pressable, { className: "style" });
cssInterop(Text, { className: "style" });

interface ButtonProps {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  onPress?: () => void
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  onPress,
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600',
    buy: 'bg-green-600',
    sell: 'bg-red-600',
  }

  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 rounded-xl ${variants[variant]} ${className}`}
    >
      <Text className="text-white font-semibold text-center">
        {children}
      </Text>
    </Pressable>
  )
}
