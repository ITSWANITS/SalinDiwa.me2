"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase/client";
import type { UserProfile } from "../types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const fetchProfile = useCallback(
    async (uid: string) => {
      try {
        const ref = doc(db, "users", uid);

        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(
            snap.data() as UserProfile
          );
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error
        );
        setProfile(null);
      }
    },
    []
  );

  const refreshProfile = useCallback(
    async () => {
      if (user) {
        await fetchProfile(user.uid);
      }
    },
    [user, fetchProfile]
  );

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser);

          if (firebaseUser) {
            await fetchProfile(
              firebaseUser.uid
            );
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [fetchProfile]);

  const logout = useCallback(
    async () => {
      try {
        await signOut(auth);

        await fetch(
          "/api/auth/session",
          {
            method: "DELETE",
          }
        );

        setUser(null);
        setProfile(null);
      } catch (error) {
        console.error(
          "Logout failed:",
          error
        );
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
