"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const userId = session?.user?.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("id, name, email, phone_number, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? { id: userId, role: null });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const loading = !sessionLoaded || (Boolean(userId) && !profile);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isLoggedIn: Boolean(userId),
        userData: userId ? profile : null,
        role: userId ? profile?.role : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
