import { useState, useEffect, useMemo } from "react";
import { useMonthlyReport } from "../../../../../context/MonthlyReportContext";
import { useParams } from "react-router";
import { useAuth } from "../../../../AUTHENTICATION/hooks/useAuth";
import { format } from "date-fns";

const toApiDateString = (date) => (date ? format(date, "yyyy-MM-dd") : "");

export function useMonthlyLogData() {
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { dateRange } = useMonthlyReport();
  const { categoryName } = useParams();
  const { token } = useAuth();

  const dateRangeKey = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    return `${dateRange.from.toISOString()}_${dateRange.to.toISOString()}`;
  }, [dateRange]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!dateRangeKey || !categoryName || !token) {
        return;
      }

      setLoading(true);
      setError(null);

      const startDate = toApiDateString(dateRange.from);
      const endDate = toApiDateString(dateRange.to);
      const API_URL = import.meta.env.VITE_BACKEND_URL || "";
      const url = `${API_URL}/api/category-logs?categoryName=${categoryName}&startDate=${startDate}&endDate=${endDate}`;

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch daily logs from the server.");
        }
        const data = await response.json();
        // --- ADDED CONSOLE LOG ---
        // This will log the fetched data to your browser's developer console.
        console.log("Fetched daily logs:", data);
        setDailyLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // --- THE FIX: The unstable `dateRange` object has been removed. ---
    // This effect now ONLY re-runs when the category or date range *values* actually change.
  }, [categoryName, dateRangeKey, token]);

  return { dailyLogs, loading, error };
}
