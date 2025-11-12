import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for user state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        await fetchRole(firebaseUser.uid);
      } else {
        setRole("");
      }
    });
    return () => unsub();
  }, []);

  // Fetch user role from Firestore collection 'users'
  const fetchRole = useCallback(async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setRole((snap.data().role ?? "").toLowerCase());
    } else {
      setRole("");
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      await fetchRole(res.user.uid);
      return { user: res.user, error: null } as const;
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
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Buat profile user di firestore (collection users), default role: owner (bisa diganti oleh admin nanti)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role_,
        created_at: new Date().toISOString()
      });
      setUser(user);
      setRole(role_);
      return { user, error: null } as const;
    } catch (err: any) {
      setError(err.message || 'Sign up gagal.');
      return { user: null, error: err } as const;
    }
  }, []);

  const doSignOut = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
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
