import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseCredentials && import.meta.env.DEV) {
  console.warn(
    "Supabase is not configured; realtime cursor sync is disabled in local development.",
  );
}

export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
