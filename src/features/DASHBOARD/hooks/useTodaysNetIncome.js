import { useState, useCallback } from "react";
import { getDailyIncome } from "../../../../api/dashboardService";

const CACHE_KEY = "todaysNetIncome";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useTodaysNetIncome() {
  const [income, setIncome] = useState("Loading...");
  const [error, setError] = useState(null);

  const fetchTodaysNetIncome = useCallback(async () => {
    try {
      const data = await getDailyIncome();
      const formattedIncome = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalNetIncome);

      setIncome(formattedIncome);
      setError(null); // Clear previous errors

      const cacheData = {
        value: formattedIncome,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error(
        "useTodaysNetIncome: Error fetching daily net income:",
        err
      );
      setError(err);
      setIncome("Error");
    }
  }, []);

  return { income, error, fetchTodaysNetIncome, CACHE_KEY, CACHE_TTL_MS };
}
