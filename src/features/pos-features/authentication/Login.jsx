// --- Login.js ---
// This component's code doesn't change, but its imports are now cleaner.

import { useState } from "react";
import { useAuth } from "./hooks/Useauth";

export function Login() {
  const { toggleView, onLoginSuccess } = useAuth(); // Consumes context via the hook

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!emailOrPhone || !password) {
      setError("Please enter both email/phone and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrPhone, password: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      if (data.token) onLoginSuccess(data.token);
      else throw new Error("Token not provided by server.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-4 flex flex-col justify-center gap-2 text-gray-800 z-2">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        Welcome Back!
      </h2>
      <p className="text-white/80 mb-8 text-center">
        Please sign in to your account.
      </p>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label
            className="block text-white text-sm font-bold mb-2"
            htmlFor="emailOrPhone"
          >
            Email or Phone
          </label>
          <input
            className="shadow-inner bg-white/20 border border-white/30 text-white placeholder-white/70 appearance-none rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="emailOrPhone"
            type="text"
            placeholder="you@example.com"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-white text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow-inner bg-white/20 border border-white/30 text-white placeholder-white/70 appearance-none rounded-lg w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-red-400 text-center text-sm mb-4">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-blue-300"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>
      <p className="text-center text-white/80 text-sm mt-6">
        Don't have an account?{" "}
        <button
          onClick={toggleView}
          className="font-bold text-white hover:text-blue-200 focus:outline-none"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}
