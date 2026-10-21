import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile, Role } from "./types";

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (args: { email: string; password: string; fullName: string; role: Role }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        console.warn("profile load error", error.message);
      }
      setProfile(data as Profile | null);
      setLoading(false);
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async ({ email, password, fullName, role }) => {
    if (role === "admin") return { error: "Admin accounts cannot be self-registered." };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) return { error: translateAuthError(error.message) };
    if (!data.user) return { error: "Sign-up failed. Please try again." };
    return { error: null };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Incorrect email or password.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("weak") || m.includes("easy to guess") || m.includes("known to be")) return "This password is too common. Please choose a more unique password.";
  if (m.includes("password should be") || m.includes("password must be") || m.includes("at least")) return "Password must be at least 8 characters.";
  if (m.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (m.includes("user not found")) return "No account found with this email.";
  if (m.includes("email") && m.includes("invalid")) return "Please enter a valid email address.";
  return msg;
}
