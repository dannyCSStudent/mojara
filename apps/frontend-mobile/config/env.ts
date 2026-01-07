import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

function getApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000"; // iOS
}
console.log("supabase url", extra.SUPABASE_URL);
export const ENV = {
  API_URL: getApiUrl(),
  SUPABASE_URL: extra.SUPABASE_URL,
  SUPABASE_ANON_KEY: extra.SUPABASE_ANON_KEY,
  
};
