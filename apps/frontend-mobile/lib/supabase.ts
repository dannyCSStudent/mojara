import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { supabaseStorage } from './supabaseStorage';

import { ENV } from '../config/env';

/* -----------------------------
   Supabase Client
----------------------------- */

console.log('Supabase URL:', ENV.SUPABASE_URL);
console.log('Supabase Anon Key:', ENV.SUPABASE_ANON_KEY);
console.log('ENV:', ENV);

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
