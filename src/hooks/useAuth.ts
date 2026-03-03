import { useEffect, useState } from "react";
import { supabase, type SupabaseUser } from "@/lib/supabase";

type SignInResult = {
  user: SupabaseUser | null;
  error: string | null;
};

type SignOutResult = {
  error: string | null;
};

type UseAuthReturn = {
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<SignOutResult>;
};

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (error) {
          const msg = error.message?.toLowerCase() ?? "";

          // Kasus umum Supabase v2 ketika belum ada sesi sama sekali.
          // Ini bukan error bagi user, cukup anggap belum login.
          if (msg.includes("auth session missing")) {
            setUser(null);
            return;
          }

          setError(error.message);
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan saat memuat user.";
        setError(message);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = error.message ?? "Login gagal. Periksa kembali email dan password.";
        setError(message);
        return { user: null, error: message };
      }

      const authenticatedUser = data.user ?? null;
      setUser(authenticatedUser);
      return { user: authenticatedUser, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga saat login.";
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<SignOutResult> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const message = error.message ?? "Logout gagal. Coba lagi.";
        setError(message);
        return { error: message };
      }

      setUser(null);
      return { error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga saat logout.";
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
  };
};

export default useAuth;

