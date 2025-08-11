import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";
import { MiniCard } from "./MiniCard";
import { useTodaysNetIncome } from "./hooks/useTodaysNetIncome";
import { useTodaysTotalSales } from "./hooks/useTodaysTotalSales";

// Helper to format numbers as PHP currency
const formatToPHP = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

export function TodaysNetIncome({ onHide }) {
  // Hook for the server-side source of truth
  const { income: fetchedIncome, fetchTodaysNetIncome } = useTodaysNetIncome();

  // This hook now directly returns the correct, up-to-date number from the context
  const localTotalSales = useTodaysTotalSales();

  // The state that will actually be displayed in the UI
  const [displayIncome, setDisplayIncome] = useState("Loading...");

  const isVisible = usePageVisibility();

  // EFFECT 1: Optimistic Update from our reliable local calculation
  useEffect(() => {
    // Since localTotalSales is now reliable, we can use it directly.
    setDisplayIncome(formatToPHP(localTotalSales));
  }, [localTotalSales]);

  // EFFECT 2: Source of Truth Sync (override with fetched value when it arrives)
  useEffect(() => {
    if (typeof fetchedIncome === "string" && fetchedIncome.startsWith("₱")) {
      setDisplayIncome(fetchedIncome);
    }
  }, [fetchedIncome]);

  // EFFECT 3: Initial Fetch and Real-time Subscription
  useEffect(() => {
    fetchTodaysNetIncome();

    const channel = supabase
      .channel("public:payments:income-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          console.log(
            "LOG: Real-time change detected, re-fetching net income."
          );
          fetchTodaysNetIncome();
        }
      );

    if (isVisible) {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodaysNetIncome, isVisible]);

  return (
    <MiniCard
      title="Today's Net Income"
      value={displayIncome}
      onHide={onHide}
    />
  );
}
