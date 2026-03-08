"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/lib/supabaseClient";

type AuthUser = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];

interface AuthContextType {
  user: AuthUser;
  employerProfile: EmployerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: string | null; requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface EmployerProfile {
  id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  profile_pic: string | null;
  background_img: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  no_of_employers: number | null;
  specialties: string | null;
  phone_number: number | null;
  email: string | null;
  country_code: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error, status } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      // Log detailed info to help debug REST errors (e.g., 406 Not Acceptable)
      console.error("fetchProfile error:", { status, error, userId });
      setEmployerProfile(null);
      return null;
    }

    setEmployerProfile(data);
    return data;
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getUser().then(async (res: any) => {
      const u = res.data.user as AuthUser | null;
      // If the user exists but isn't an employer, proactively sign them out
      const userType = u?.user_metadata?.usertype;
      if (u && userType !== "employer") {
        await supabase.auth.signOut();
        setUser(null);
        setEmployerProfile(null);
        setLoading(false);
        return;
      }

      setUser(u);
      if (u) {
        const profile = await fetchProfile(u.id);
        // If employer has no profile yet, and we're not already on the setup page,
        // redirect them to complete their company profile.
        if (!profile && pathname !== "/auth/employer-setup-profile") {
          router.push("/auth/employer-setup-profile");
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: { user?: { id: string; email?: string; user_metadata?: { usertype?: string } } } | null) => {
      const u = session?.user ?? null;
      const userType = u?.user_metadata?.usertype;

      // If a non-employer signs in, clear session and prevent access
      if (u && userType !== "employer") {
        await supabase.auth.signOut();
        setUser(null);
        setEmployerProfile(null);
        setLoading(false);
        return;
      }

      setUser(u as AuthUser);
      if (u) {
        const profile = await fetchProfile(u.id);
        if (!profile && pathname !== "/auth/employer-setup-profile") {
          router.push("/auth/employer-setup-profile");
        }
      } else setEmployerProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Helpful for debugging: log the full sign-in response from Supabase
    console.log("supabase signIn response:", { data, error });

    // If Supabase returned a user but their metadata does not mark them as an employer,
    // immediately sign them out and return a friendly error message for the UI.
    const signedInUser = data?.user ?? null;
    const userType = signedInUser?.user_metadata?.usertype;
    if (signedInUser && userType !== "employer") {
      await supabase.auth.signOut();
      return { error: "This account is not registered as an employer." };
    }

    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, usertype: "employer" } },
    });
    if (error) {
      return { error: error.message, requiresEmailConfirmation: false };
    }

    // If Supabase created a session/user immediately, create a matching
    // `user_profiles` row so the app-level profile exists.
    if (data?.user) {
      try {
        await supabase.from("user_profiles").insert({
          id: data.user.id,
          username,
          email,
          usertype: "employer",
          confirmed: Boolean(data.session),
          provider: "email",
        });
      } catch (e) {
        // ignore insert errors here; the signup succeeded at auth level.
        console.warn("failed to insert user_profiles row:", e);
      }
    }

    return {
      error: null,
      requiresEmailConfirmation: !data.session,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmployerProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, employerProfile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
