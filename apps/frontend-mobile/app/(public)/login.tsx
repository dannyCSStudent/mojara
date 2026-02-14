import { useState } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { Screen } from "../../components/Screen";
import { AppText } from "../../components/AppText";

export default function LoginScreen() {
  const signIn = useAppStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      console.error(err);
      Alert.alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <AppText variant="title" className="mb-2">
          Welcome Back
        </AppText>

        <AppText variant="body" className="mb-8">
          Sign in to continue to your markets.
        </AppText>

        {/* Email */}
        <View className="mb-4">
          <AppText variant="caption" className="mb-2">
            Email
          </AppText>

          <TextInput
            className="rounded-2xl border border-gray-300 dark:border-neutral-700 px-4 py-4 text-base bg-gray-100 dark:bg-neutral-800 text-black dark:text-white"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View className="mb-6">
          <AppText variant="caption" className="mb-2">
            Password
          </AppText>

          <TextInput
            className="rounded-2xl border border-gray-300 dark:border-neutral-700 px-4 py-4 text-base bg-gray-100 dark:bg-neutral-800 text-black dark:text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Button */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-2xl py-4 items-center ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          <AppText variant="subheading" className="text-white">
            {loading ? "Signing In..." : "Sign In"}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
