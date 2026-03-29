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

  async function createGoogleProfile(user, type) {
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

    const email = user.email;
    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);

    await supabase.from("users").insert({
      id: user.id,
      email,
      type,
      username: baseUsername,
      approved: type === "buyer",
      ...locationData,
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          // Check if user already has a profile
          const { data: existing } = await supabase
            .from("users")
            .select("id, type")
            .eq("id", session.user.id)
            .single();

          if (!existing) {
            // New Google user — read type from localStorage
            const storedType = localStorage.getItem("artspace_signup_type") || "buyer";
            localStorage.removeItem("artspace_signup_type");
            await createGoogleProfile(session.user, storedType);
            // Redirect based on type
            window.location.href = storedType === "artist" ? "/onboarding" : "/feed";
            return;
          }

          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile !== null) setLoading(false);
  }, [profile]);

  async function signUp(email, password, userType) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

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

    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);

    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      type: userType,
      username: baseUsername,
      approved: userType === "buyer",
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

  async function signInWithGoogle(type = null) {
    if (type) localStorage.setItem("artspace_signup_type", type);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
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
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
