import { useContext, useState } from "react";

import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext";

export function Signup() {
  const { toggle } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    // ... reset state logic
    setIsLoading(true);

    // Call Supabase directly to sign up
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { fullName } }, // Pass fullName to match backend
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Signup successful! Check your email for verification.");
      // ... clear form logic
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-3xl bg-white/30 backdrop-blur-lg border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-4 flex flex-col justify-center gap-2 text-body-text z-2">
      <h2 className="text-3xl font-bold text-body-text mb-2 text-center">
        Create Your Account
      </h2>
      <p className="text-body-text/80 mb-8 text-center">
        Join us and start your journey.
      </p>
      <form onSubmit={handleSignup}>
        {/* Full Name Input */}
        <div className="mb-4">
          <label
            className="block text-body-text text-sm font-bold mb-2"
            htmlFor="fullName"
          >
            Full Name
          </label>
          <input
            className="shadow-inner bg-white/20 border border-white/30 text-body-text placeholder-white/70 appearance-none rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400"
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        {/* Email Input */}
        <div className="mb-4">
          <label
            className="block text-body-text text-sm font-bold mb-2"
            htmlFor="signup-email"
          >
            Email Address
          </label>
          <input
            className="shadow-inner bg-white/20 border border-white/30 text-body-text placeholder-white/70 appearance-none rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400"
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* Password Input */}
        <div className="mb-6">
          <label
            className="block text-body-text text-sm font-bold mb-2"
            htmlFor="signup-password"
          >
            Password
          </label>
          <input
            className="shadow-inner bg-white/20 border border-white/30 text-body-text placeholder-white/70 appearance-none rounded-lg w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400"
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Error and Success Messages */}
        {error && (
          <p className="text-red-400 text-center text-sm mb-4">{error}</p>
        )}
        {success && (
          <p className="text-green-300 text-center text-sm mb-4">{success}</p>
        )}
        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-body-text font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-green-300"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </form>
      <p className="text-center text-body-text/80 text-sm mt-6">
        Already have an account?{" "}
        <button
          onClick={() => {
            toggle((prev) => !prev);
          }}
          className="font-bold text-body-text hover:text-green-200 focus:outline-none"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
