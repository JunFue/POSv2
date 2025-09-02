import { format, startOfDay } from "date-fns";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../features/AUTHENTICATION/hooks/useAuth";
import { fetchMonthlyReportApi } from "../features/SETTINGS/hooks/useMonthlyReportApi";

const MonthlyReportContext = createContext();

const toLocalDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

export function MonthlyReportProvider({ children }) {
  const { user, token } = useAuth();
  const storageKey = `monthlyReportData_${user?.id || "guest"}`;

  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { range, data } = JSON.parse(saved);
        // Convert string dates back to Date objects
        setDateRange({
          from: new Date(range.from),
          to: new Date(range.to),
        });
        setReportData(data);
      } else {
        // Set a default range if nothing is saved
        const today = startOfDay(new Date());
        setDateRange({ from: today, to: today });
      }
    } catch (err) {
      console.error("Failed to load monthly report data from storage", err);
      const today = startOfDay(new Date());
      setDateRange({ from: today, to: today });
    }
  }, [storageKey]);

  const fetchAndSaveReport = useCallback(
    async (newRange) => {
      if (!token) {
        setError("You must be logged in to fetch reports.");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMonthlyReportApi(newRange, token);
        setReportData(data);
        setDateRange(newRange);

        // Save to local storage
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            range: {
              from: toLocalDateString(newRange.from),
              to: toLocalDateString(newRange.to),
            },
            data,
          })
        );
      } catch (err) {
        console.error("Failed to fetch monthly report:", err);
        setError("Could not fetch the report data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [token, storageKey]
  );

  const value = {
    reportData,
    dateRange,
    loading,
    error,
    fetchAndSaveReport,
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
