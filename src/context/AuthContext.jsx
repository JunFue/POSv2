import React, { createContext, useState } from "react";

// --- AuthContext.js ---
// This file now *only* creates the context and the provider component.
// This resolves the "Fast Refresh" warning.

// 1. Create the context and export it so the hook can use it.
const AuthContext = createContext();

// 2. Create and export the Provider component
export function AuthProvider({ children }) {
  const [isLoginView, setIsLoginView] = useState(true);
  // Get token from localStorage on initial load
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  const onLoginSuccess = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
    console.log("Login successful! Token:", token);
    alert("Login Successful! You would be redirected now.");
  };

  const value = {
    isLoginView,
    toggleView,
    onLoginSuccess,
    authToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
