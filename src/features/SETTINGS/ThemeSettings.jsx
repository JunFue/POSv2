import { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { ThemeContext } from "../../context/ThemeContext";

export function ThemeSettings() {
  const { theme, setTheme, availableThemes } = useContext(ThemeContext);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-head-text">Theme</h2>
      <div className="mt-4">
        <p className="text-sm mb-2 text-body-text/80">
          Change application theme
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
  );
}
