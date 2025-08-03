import React, { useState, useEffect, useCallback, useRef } from "react";
import { MiniCard } from "../MiniCard";
import { supabase } from "../../../../utils/supabaseClient";
import { getDailyIncome } from "../../../../api/dashboardService";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

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

      // Cache an object with the value and a timestamp
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
    let isCacheValid = false;

    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setIncomeValue(value);
        isCacheValid = true;
      }
    }

    // **FIX:** Only fetch initial data if the cache is not valid.
    // The real-time subscription will handle updates regardless.
    if (!isCacheValid) {
      fetchIncome();
    }

    // --- Real-time Subscription ---
    const channel = supabase
      .channel("public:payments:income-realtime") // It's good practice to give realtime channels a unique name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          // Call the debounced function on any change
          debouncedFetchRef.current();
        }
      );

    // Pause/resume subscription based on page visibility
    if (isVisible) {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncome, isVisible]);

  return <MiniCard title="Daily Income" value={incomeValue} onHide={onHide} />;
}
