import React, { createContext, useState } from "react";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SettingsContext.Provider value={{ showSettings, setShowSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsContext };
