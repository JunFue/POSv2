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

  // This effect runs once on mount to load the initial date range from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedRange = JSON.parse(saved);
        // --- FIX: Prevent timezone shifting bug ---
        // Appending 'T00:00:00' ensures the date string is parsed in the user's local timezone,
        // not as UTC, which can cause the date to shift back one day.
        const fromDate = parsedRange.from
          ? new Date(`${parsedRange.from}T00:00:00`)
          : null;
        const toDate = parsedRange.to
          ? new Date(`${parsedRange.to}T00:00:00`)
          : null;

        setDateRange({
          from: fromDate,
          to: toDate,
        });
      } else {
        // Set a default range if nothing is saved
        const today = startOfDay(new Date());
        setDateRange({ from: today, to: today });
      }
    } catch (err) {
      console.error("Failed to load date range from storage", err);
      // Fallback to a default range on error
      const today = startOfDay(new Date());
      setDateRange({ from: today, to: today });
    }
  }, [storageKey]);

  const setAndSaveDateRange = useCallback(
    (newRange) => {
      // Ensure we have valid dates before saving
      const rangeToSave = {
        from: newRange.from instanceof Date ? newRange.from : null,
        to: newRange.to instanceof Date ? newRange.to : null,
      };

      setDateRange(rangeToSave);

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          from: toApiDateString(rangeToSave.from),
          to: toApiDateString(rangeToSave.to),
        })
      );
    },
    [storageKey]
  );

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

// --- FIX: Removed the extra closing brace that was here ---
