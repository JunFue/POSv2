import { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { MonthlyReportSettings } from "./MonthlyReportSettings";
import { ThemeSettings } from "./ThemeSettings";

export function Settings() {
  const { setShowSettings } = useContext(SettingsContext);

  return (
    // Full-screen overlay with a semi-transparent backdrop
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Main settings panel with improved styling */}
      <div className="relative w-full max-w-2xl min-h-[400px] traditional-glass text-body-text rounded-xl shadow-lg p-8">
        {/* Close button moved here for better separation of concerns */}
        <button
          onClick={() => setShowSettings(false)}
          className="absolute top-4 right-4 text-3xl font-bold text-head-text hover:text-gray-400 transition-colors"
          aria-label="Close settings"
        >
          &times;
        </button>

        {/* Main content area */}
        <div className="flex flex-col gap-6">
          <ThemeSettings />
          <MonthlyReportSettings />
        </div>
      </div>
    </div>
  );
}
