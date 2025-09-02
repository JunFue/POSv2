import { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { MonthlyReportSettings } from "./MonthlyReportSettings";
import { ThemeSettings } from "./ThemeSettings";

export function Settings() {
  const { setShowSettings } = useContext(SettingsContext);

  return (
    // Full-screen overlay with a semi-transparent backdrop
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Main settings panel */}
      <div className="relative w-full max-w-2xl traditional-glass text-body-text rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        {/* Header Area with Close Button */}
        <div className="p-6 pb-0 flex-shrink-0">
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-4 right-4 text-3xl font-bold text-head-text hover:text-gray-400 transition-colors z-10"
            aria-label="Close settings"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-8 pt-4">
          <div className="flex flex-col gap-6">
            <ThemeSettings />
            {/* Pass a function down to the child that closes the dialog */}
            <MonthlyReportSettings
              onSaveComplete={() => setShowSettings(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
