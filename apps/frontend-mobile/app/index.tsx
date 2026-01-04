import { Text, View } from 'react-native'
import { Button } from '@repo/ui'

export default function Page() {
  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px]">
        <Button appName="MyApp">Click Me</Button>
        <Text className="text-[64px] font-bold">Hello World</Text>
        <Text className="text-[36px] text-slate-700">
          This is the first page of your app.
        </Text>
      </View>
    </View>
  )
}
