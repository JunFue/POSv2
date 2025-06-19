import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const THEMES = ["light", "dark", "default", "neomorphic"];

const ThemeContext = createContext();

export const ThemeProviders = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return THEMES.includes(storedTheme) ? storedTheme : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    THEMES.forEach(() => root.removeAttribute(`data-theme`));

    // Add the current theme's data-theme attribute
    // We don't need to set for 'light' if it's our :root default, but this is cleaner.
    root.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, availableThemes: THEMES }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext };
