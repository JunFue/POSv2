import React, { useState, useEffect } from "react";
import { MiniCard } from "./MiniCard";
import { usePaymentContext } from "../../../../../context/PaymentContext";

// Helper to format numbers as PHP currency
const formatToPHP = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value || 0); // Default to 0 if value is undefined

export function TodaysGrossSalesCard({ onHide }) {
  // 1. Consume the pre-calculated gross sales value from the context.
  const { todaysGrossSales } = usePaymentContext();

  // 2. State that will be displayed in the UI.
  const [displaySales, setDisplaySales] = useState("Loading...");

  // 3. An effect to optimistically update the UI whenever the value from the context changes.
  useEffect(() => {
    // The context provides the up-to-date number directly.
    // We just need to format it for display.
    setDisplaySales(formatToPHP(todaysGrossSales));
  }, [todaysGrossSales]); // This effect runs whenever todaysGrossSales is recalculated in the context.

  // 4. The component is now a simple "dumb" component that just displays the value.
  return (
    <MiniCard
      title="Today's Gross Sales"
      value={displaySales}
      onHide={onHide}
    />
  );
}
