import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env";
console.log("Supabase URL:", ENV.SUPABASE_URL);
export const supabase = createClient(
   
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
);
