import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
// --- 1. Import the Supabase client ---

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // --- 2. Manage the Supabase session state ---
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- 3. Get the initial session ---
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // --- 4. Listen for auth state changes (login, logout, etc.) ---
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // --- 5. Cleanup the listener when the component unmounts ---
    return () => subscription.unsubscribe();
  }, []);

  // --- 6. Provide the session and user to the rest of the app ---
  const value = {
    session,
    user: session?.user ?? null,
  };

  // Only render children when the initial session has been loaded
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
