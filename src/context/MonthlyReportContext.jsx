import { format, startOfDay } from "date-fns";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../features/AUTHENTICATION/hooks/useAuth";

const MonthlyReportContext = createContext();

const toApiDateString = (date) => (date ? format(date, "yyyy-MM-dd") : "");

export function MonthlyReportProvider({ children }) {
  const { user } = useAuth();
  const storageKey = `monthlyReportSettings_${user?.id || "guest"}`;

  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedRange = JSON.parse(saved);
        setDateRange({
          from: new Date(parsedRange.from),
          to: new Date(parsedRange.to),
        });
      } else {
        const today = startOfDay(new Date());
        setDateRange({ from: today, to: today });
      }
    } catch (err) {
      console.error("Failed to load date range from storage", err);
    }
  }, [storageKey]);

  const setAndSaveDateRange = useCallback(
    (newRange) => {
      setDateRange(newRange);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          from: toApiDateString(newRange.from),
          to: toApiDateString(newRange.to),
        })
      );
    },
    [storageKey]
  );

  // The context now only provides the date range and a way to set it.
  // All log-related state has been removed.
  const value = {
    dateRange,
    setAndSaveDateRange,
  };

  return (
    <MonthlyReportContext.Provider value={value}>
      {children}
    </MonthlyReportContext.Provider>
  );
}

export const useMonthlyReport = () => {
  const context = useContext(MonthlyReportContext);
  if (!context) {
    throw new Error(
      "useMonthlyReport must be used within a MonthlyReportProvider"
    );
  }
  return context;
};
