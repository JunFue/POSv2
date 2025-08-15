import React, { useState, useEffect } from "react";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";
import { MiniCard } from "./MiniCard";
import { useFetchTodaysNet } from "./hooks/useFetchTodaysNet";
import { usePaymentContext } from "../../../../context/PaymentContext";

// Helper to format numbers as PHP currency
const formatToPHP = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

export function TodaysNetIncome({ onHide }) {
  // Hook for the server-side source of truth
  const { income: fetchedIncome, fetchTodaysNetIncome } = useFetchTodaysNet();

  // This hook now directly returns the correct, up-to-date number from the context
  const { todaysNetSales } = usePaymentContext();

  // The state that will actually be displayed in the UI
  const [displayIncome, setDisplayIncome] = useState("Loading...");

  const isVisible = usePageVisibility();

  // EFFECT 1: Optimistic Update from our reliable local calculation
  useEffect(() => {
    // Since localTotalSales is now reliable, we can use it directly.
    setDisplayIncome(formatToPHP(todaysNetSales));
  }, [todaysNetSales]);

  // EFFECT 2: Source of Truth Sync (override with fetched value when it arrives)
  useEffect(() => {
    if (typeof fetchedIncome === "string" && fetchedIncome.startsWith("₱")) {
      setDisplayIncome(fetchedIncome);
    }
  }, [fetchedIncome]);

  // EFFECT 3: Initial Fetch
  // Fetches the source-of-truth value from the server when the component mounts.
  // Real-time updates are now handled by the PaymentContext.
  useEffect(() => {
    if (isVisible) {
      fetchTodaysNetIncome();
    }
  }, [fetchTodaysNetIncome, isVisible]);

  return (
    <MiniCard
      title="Today's Net Income"
      value={displayIncome}
      onHide={onHide}
    />
  );
}
