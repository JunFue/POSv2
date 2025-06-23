import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

// FIX 1: Add "light" to the array of available themes.
const THEMES = ["light", "dark", "evergreen"];

const ThemeContext = createContext();

export const ThemeProviders = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // This logic is now more robust since "light" is a valid theme.
    const storedTheme = localStorage.getItem("theme");
    return THEMES.includes(storedTheme) ? storedTheme : "light";
  });

  // FIX 2: This effect now correctly manages theme classes on the <html> element.
  useEffect(() => {
    const root = document.documentElement;

    // Remove all possible theme classes for a clean slate.
    THEMES.forEach((t) => {
      root.classList.remove(t);
    });

    // Add the current theme's class.
    // We don't add the "light" class because its styles are in the :root selector,
    // which is the default.
    if (theme !== "light") {
      root.classList.add(theme);
    }

    // Persist the theme choice.
    localStorage.setItem("theme", theme);
  }, [theme]);

  // FIX 3: This function now correctly handles all themes, including "light".
  const setTheme = useCallback((newTheme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []); // The empty dependency array is acceptable here.

  const value = useMemo(
    () => ({ theme, setTheme, availableThemes: THEMES }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext };
