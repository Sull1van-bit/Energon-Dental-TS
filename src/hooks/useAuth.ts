import { useEffect, useState, useCallback } from "react";
import { supabase, type SupabaseUser } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", uid)
      .maybeSingle();

    if (error || !data) {
      setRole("");
      return;
    }

    setRole((data.role ?? "").toLowerCase());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        setUser(null);
        setRole("");
        setLoading(false);
        return;
      }

      setUser(user);
      setLoading(false);

      if (user) {
        await fetchRole(user.id);
      }
    }

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchRole(currentUser.id);
      } else {
        setRole("");
      }
    });

    void init();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw error || new Error("Login gagal.");
      }

      setUser(data.user);
      await fetchRole(data.user.id);
      return { user: data.user, error: null } as const;
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
      setUser(null);
      setRole("");
      return { user: null, error: err } as const;
    }
  }, [fetchRole]);

  const signUp = useCallback(async (email: string, password: string, role_: string = "owner") => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) {
        throw error || new Error("Sign up gagal.");
      }

      await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        role: role_,
        created_at: new Date().toISOString(),
      });

      setUser(data.user);
      setRole(role_);
      return { user: data.user, error: null } as const;
    } catch (err: any) {
      setError(err.message || 'Sign up gagal.');
      return { user: null, error: err } as const;
    }
  }, []);

  const doSignOut = useCallback(async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole("");
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  }, []);

  return {
    user,
    role,
    loading,
    error,
    signIn,
    signUp,
    signOut: doSignOut
  } as const;
}

export default useAuth;
