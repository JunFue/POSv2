import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

import { MiniCard } from "./MiniCard";
import { useTodaysNetIncome } from "../../hooks/useTodaysNetIncome";

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

export function TodaysNetIncome({ onHide }) {
  const { income, fetchTodaysNetIncome, CACHE_KEY, CACHE_TTL_MS } =
    useTodaysNetIncome();
  const [incomeValue, setIncomeValue] = useState(income);
  const isVisible = usePageVisibility();

  const debouncedFetchRef = useRef(
    debounce(() => {
      fetchTodaysNetIncome();
    }, 500)
  );

  useEffect(() => {
    setIncomeValue(income);
  }, [income]);

  useEffect(() => {
    // --- Initial Load ---
    const cachedItem = localStorage.getItem(CACHE_KEY);
    let isCacheValid = false;

    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setIncomeValue(value);
        isCacheValid = true;
      }
    }

    if (!isCacheValid) {
      fetchTodaysNetIncome();
    }

    // --- Real-time Subscription ---
    const channel = supabase
      .channel("public:payments:income-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          debouncedFetchRef.current();
        }
      );

    if (isVisible) {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodaysNetIncome, isVisible, CACHE_KEY, CACHE_TTL_MS]);

  return (
    <MiniCard title="Today's Net Income" value={incomeValue} onHide={onHide} />
  );
}
