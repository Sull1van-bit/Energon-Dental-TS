import { createClient } from "@supabase/supabase-js";

// Read from Vite env (must be prefixed with VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if ((import.meta.env.DEV || import.meta.env.MODE === "development") && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export default supabase;
