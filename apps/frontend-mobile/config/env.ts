import { Platform } from 'react-native';

function getDefaultApiUrl() {
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

function required(key: string, value?: string) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  API_URL: (globalThis as any).process?.env?.EXPO_PUBLIC_API_URL || getDefaultApiUrl(),

  SUPABASE_URL: required(
    'SUPABASE_URL',
    (globalThis as any).process?.env?.EXPO_PUBLIC_SUPABASE_URL
  ),

  SUPABASE_ANON_KEY: required(
    'SUPABASE_ANON_KEY',
    (globalThis as any).process?.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ),
};
