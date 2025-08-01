import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignOn, toggle] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Combine all state and functions into a single object
  const value = {
    session,
    user: session?.user ?? null,
    // --- FIX ---
    // Expose the access_token from the session object as 'token'
    token: session?.access_token ?? null,
    isSignOn,
    toggle,
  };

  return (
    // Provide the single 'value' object to the context
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
