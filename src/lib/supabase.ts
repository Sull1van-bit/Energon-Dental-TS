import { createClient, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum di-set. Supabase client mungkin tidak bisa digunakan."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseUser = User;

