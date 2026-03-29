import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Called after profile is fetched
  useEffect(() => {
    if (profile !== null) setLoading(false);
  }, [profile]);

  async function signUp(email, password, userType) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Silently fetch location via ipapi.co (no key needed)
    let locationData = { lat: null, lng: null, country: null };
    try {
      const res = await fetch("https://ipapi.co/json/");
      const loc = await res.json();
      locationData = {
        lat: loc.latitude ?? null,
        lng: loc.longitude ?? null,
        country: loc.country_name ?? null,
      };
    } catch { /* silent fail */ }

    // Generate a default username from email
    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);

    // Insert user row
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      type: userType,
      username: baseUsername,
      approved: userType === "buyer", // buyers are auto-approved; artists need admin approval
      ...locationData,
    });
    if (profileError) throw profileError;

    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  async function refreshProfile() {
    if (session?.user?.id) await fetchProfile(session.user.id);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
