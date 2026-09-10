"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface TacticalUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: TacticalUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsDemo: (role?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInAsDemo: () => {},
});

const DEMO_STORAGE_KEY = "pratyaksh_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TacticalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo user is active in localStorage first
    if (typeof window !== "undefined") {
      const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setLoading(false);
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user authenticated
        if (typeof window !== "undefined") {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Tactical Operator"),
          role: "Crisis Command Specialist",
          isDemo: false,
        });
      } else {
        // If not firebase user, keep demo user if existing, else null
        if (typeof window !== "undefined") {
          const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
          if (savedDemo) {
            try {
              setUser(JSON.parse(savedDemo));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
      await createUserWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        // Safe fallback if offline or demo user
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = (role: string = "Senior Crisis Controller") => {
    const demoUser: TacticalUser = {
      uid: "demo-evaluator-omega-99",
      email: "evaluator@pratyaksh-omega.org",
      displayName: "Tactical Evaluator",
      role,
      isDemo: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    }
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
