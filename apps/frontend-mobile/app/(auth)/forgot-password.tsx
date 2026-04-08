import { useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert('Please enter your email.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL('/reset-password'),
      });

      if (error) throw error;

      Alert.alert('Check your email', 'We sent you a password reset link.');

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center px-6">
        <AppText variant="title" className="mb-2">
          Reset Password
        </AppText>

        <AppText variant="body" className="mb-8">
          Enter your email and we’ll send you a reset link.
        </AppText>

        <View className="mb-6">
          <AppText variant="caption" className="mb-2">
            Email
          </AppText>

          <TextInput
            className="rounded-2xl border border-gray-300 bg-gray-100 px-4 py-4 text-base text-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Pressable
          onPress={handleReset}
          disabled={loading}
          className={`items-center rounded-2xl py-4 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}>
          <AppText variant="subheading" className="text-white">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
