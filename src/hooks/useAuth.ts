import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      // Fetch current user session without using throw/catch for local flow control
      const { data, error: getUserError } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (getUserError) {
        setError(getUserError.message);
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }

      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    void init();

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return { user: null, error } as const;
      }
      setUser(data.user);
      return { user: data.user, error: null } as const;
    },
    []
  );

  const signOut = useCallback(async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    return { error } as const;
  }, []);

  return { user, loading, error, signInWithPassword, signOut } as const;
}

export default useAuth;
