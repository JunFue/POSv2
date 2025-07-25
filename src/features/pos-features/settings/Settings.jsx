import { useContext } from "react";
import { SettingsContext } from "../../../context/SettingsContext";
import { ThemeContext } from "../../../context/ThemeContext";
// Import useAuth
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../authentication/hooks/useAuth";

// The base URL for your API.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/admin`;

export function Settings() {
  const { setShowSettings } = useContext(SettingsContext);
  const { theme, setTheme, availableThemes } = useContext(ThemeContext);
  const { user, session } = useAuth(); // Get user and session from your auth context

  // Function to handle the user deletion
  const handleDeleteAccount = async () => {
    if (!user) {
      alert("Could not find user. Please log in again.");
      return;
    }

    // Confirm the action with the user
    const isConfirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account.");
      }

      alert("Account deleted successfully.");

      // --- FIX: Sign out and reload to un-stick the frontend ---
      await supabase.auth.signOut();
      window.location.reload();
      // --- END FIX ---
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="absolute top-[5vh] left-[35vw] w-[30vw] min-h-[20vw] traditional-glass flex flex-col justify-between gap-4 text-body-text z-2">
      <div>
        <button
          onClick={() => setShowSettings(false)}
          aria-label="Close settings"
          className="absolute top-6 right-6 text-2xl font-bold text-body-text hover:text-head-text transition-colors"
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-2 text-head-text">Settings</h1>
        <p className="text-sm hover:underline cursor-pointer">
          Additional Features
        </p>
        <p className="text-sm hover:underline cursor-pointer">Currency</p>

        <div className="mt-4">
          <p className="text-sm mb-2">Change Theme</p>
          <div className="grid grid-cols-2 gap-2">
            {availableThemes.map((themeName) => (
              <button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={`capitalize p-2 rounded-md text-center text-xs transition-all text-body-text! glass-button ${
                  theme === themeName ? "bg-background! font-bold" : ""
                }`}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Delete Account Section --- */}
      <div className="mt-6 pt-4 border-t border-red-300/50">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="text-xs text-head-text mb-2">
          This action is permanent and cannot be reversed.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-600 text-body-text font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
