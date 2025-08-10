import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

import { MiniCard } from "./MiniCard";
import { useTodaysNetIncome } from "../../hooks/useTodaysNetIncome";
import { useTodaysTotalSales } from "../../hooks/useTodaysTotalSales";

// Helper to format numbers as PHP currency
const formatToPHP = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

export function TodaysNetIncome({ onHide }) {
  // Hook for the server-side source of truth
  const { income: fetchedIncome, fetchTodaysNetIncome } = useTodaysNetIncome();

  // Hook for the instant, client-side optimistic value
  const localTotalSales = useTodaysTotalSales();

  // The state that will actually be displayed in the UI
  const [displayIncome, setDisplayIncome] = useState("Loading...");

  const isVisible = usePageVisibility();

  // EFFECT 1: Optimistic Update
  // Instantly updates the display when a local transaction occurs.
  useEffect(() => {
    // We check for > 0 to avoid showing "₱0.00" on initial load before the fetch completes.
    if (localTotalSales > 0) {
      setDisplayIncome(formatToPHP(localTotalSales));
    }
  }, [localTotalSales]);

  // EFFECT 2: Source of Truth Sync
  // Updates the display with the fetched value from the database when it arrives.
  useEffect(() => {
    // Check if fetchedIncome is a valid, formatted currency string
    if (typeof fetchedIncome === "string" && fetchedIncome.startsWith("₱")) {
      setDisplayIncome(fetchedIncome);
    }
  }, [fetchedIncome]);

  // EFFECT 3: Initial Fetch and Real-time Subscription
  // Fetches the source of truth on component mount and listens for DB changes.
  useEffect(() => {
    // Initial fetch
    fetchTodaysNetIncome();

    // Set up a real-time subscription to the payments table
    const channel = supabase
      .channel("public:payments:income-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          // When the database changes, re-fetch the source of truth to stay in sync.
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
