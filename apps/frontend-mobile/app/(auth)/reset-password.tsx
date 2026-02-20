import { useState, useEffect } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../lib/supabase";
import { Screen } from "../../components/Screen";
import { AppText } from "../../components/AppText";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // ✅ Hydrate Supabase session from recovery link
  useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    
    try {
      const url = event.url;
      if (!url) return;

      const hash = url.split("#")[1];
      if (!hash) return;

      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      console.log("Deep link URL:", url);

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          Alert.alert("Error", "Invalid or expired recovery link.");
          return;
        }

        setSessionReady(true);
      }
    } catch (err) {
      console.error("Deep link error:", err);
    }
  };

  // Listen for links while app is running
  const subscription = Linking.addEventListener("url", handleDeepLink);

  // Also handle if app was cold-started
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => {
    subscription.remove();
  };
}, []);


  function validatePassword() {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return false;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long."
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return false;
    }

    return true;
  }

  async function handleReset() {
    if (!sessionReady) {
      Alert.alert("Error", "Session not ready. Please reopen the link.");
      return;
    }

    if (!validatePassword()) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      Alert.alert("Success", "Your password has been updated.", [
        {
          text: "Continue",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center px-6">
        <AppText variant="title" className="mb-2">
          Create New Password
        </AppText>

        <AppText variant="body" className="mb-8">
          Enter a new password for your account.
        </AppText>

        <View className="mb-4">
          <AppText variant="caption" className="mb-2">
            New Password
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

        <View className="mb-6">
          <AppText variant="caption" className="mb-2">
            Confirm Password
          </AppText>

          <TextInput
            className="rounded-2xl border border-gray-300 dark:border-neutral-700 px-4 py-4 text-base bg-gray-100 dark:bg-neutral-800 text-black dark:text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          onPress={handleReset}
          disabled={loading}
          className={`rounded-2xl py-4 items-center ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          <AppText variant="subheading" className="text-white">
            {loading ? "Updating..." : "Update Password"}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
