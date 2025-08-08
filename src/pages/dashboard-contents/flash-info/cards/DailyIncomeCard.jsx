import React, { useState, useEffect, useCallback, useRef } from "react";
import { MiniCard } from "../MiniCard";
import { supabase } from "../../../../utils/supabaseClient";
import { getDailyIncome } from "../../../../api/dashboardService";
import { usePageVisibility } from "../../../../hooks/usePageVisibility"; // Assuming a custom hook for visibility

const CACHE_KEY = "dailyIncomeData";
const CACHE_TTL_MS = 5 * 60 * 1000; // Cache is valid for 5 minutes

// A simple debounce utility
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function DailyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const isVisible = usePageVisibility();

  // Use a ref for the debounced function so it persists across renders
  const debouncedFetchRef = useRef(
    debounce(() => {
      fetchIncome();
    }, 500) // Debounce fetch by 500ms
  );

  const fetchIncome = useCallback(async () => {
    try {
      const data = await getDailyIncome();
      const formattedIncome = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalNetIncome);

      setIncomeValue(formattedIncome);

      // 1. IMPROVEMENT: Cache an object with the value and a timestamp
      const cacheData = {
        value: formattedIncome,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("DailyIncomeCard: Error fetching daily income:", error);
      setIncomeValue("Error");
    }
  }, []);

  useEffect(() => {
    // --- Initial Load ---
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      // 1. IMPROVEMENT: Check if cache is stale
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setIncomeValue(value);
      }
    }
    // Always fetch latest data on mount regardless of cache
    fetchIncome();

    // --- Real-time Subscription ---
    const channel = supabase
      .channel("public:payments:income")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          // 2. IMPROVEMENT: Call the debounced function
          debouncedFetchRef.current();
        }
      );

    // 3. IMPROVEMENT: Pause/resume subscription based on page visibility
    if (isVisible) {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncome, isVisible]);

  return <MiniCard title="Daily Income" value={incomeValue} onHide={onHide} />;
}
