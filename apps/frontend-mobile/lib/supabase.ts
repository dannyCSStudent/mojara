import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { supabaseStorage } from "./supabaseStorage";

import { ENV } from '../config/env';


/* -----------------------------
   Supabase Client
----------------------------- */

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: supabaseStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

