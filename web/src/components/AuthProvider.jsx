"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const userId = session?.user?.id;

  const fetchProfile = useCallback(async (id) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, phone_number, role, title, bio, avatar, created_at")
      .eq("id", id)
      .maybeSingle();
    return data ?? { id, role: null };
  }, []);

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
    fetchProfile(userId).then((data) => {
      if (active) setProfile(data);
    });
    return () => {
      active = false;
    };
  }, [userId, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) setProfile(await fetchProfile(userId));
  }, [userId, fetchProfile]);

  const loading = !sessionLoaded || (Boolean(userId) && !profile);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isLoggedIn: Boolean(userId),
        userData: userId ? profile : null,
        role: userId ? profile?.role : null,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
