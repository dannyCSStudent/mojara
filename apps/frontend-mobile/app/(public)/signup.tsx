import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../components/Screen";
import { AppText } from "../../components/AppText";
import { AppButton } from "../../components/AppButton";
import { useAppStore } from "../../store/useAppStore";

export default function SignupScreen() {
  const signUp = useAppStore((s) => s.signUp);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    if (!email || !password || !confirm) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password);

      router.replace("/"); // redirect to root (auth guard will handle)
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="mt-8">
        <AppText variant="title" className="mb-2">
          Create Account
        </AppText>

        <AppText variant="muted" className="mb-6">
          Sign up to start tracking markets and prices.
        </AppText>

        {/* Email */}
        <View className="mb-4">
          <AppText className="mb-2">Email</AppText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-black dark:text-white"
          />
        </View>

        {/* Password */}
        <View className="mb-4">
          <AppText className="mb-2">Password</AppText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-black dark:text-white"
          />
        </View>

        {/* Confirm */}
        <View className="mb-4">
          <AppText className="mb-2">Confirm Password</AppText>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Confirm password"
            className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-black dark:text-white"
          />
        </View>

        {/* Error */}
        {error && (
          <AppText variant="caption" className="text-red-500 mb-4">
            {error}
          </AppText>
        )}

        {/* Button */}
        <AppButton
          onPress={handleSignup}
          loading={loading}
          className="mt-2"
        >
          Create Account
        </AppButton>

        {/* Login Link */}
        <Pressable
          onPress={() => router.push("/login")}
          className="mt-6 items-center"
        >
          <AppText variant="caption">
            Already have an account? Log in
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
