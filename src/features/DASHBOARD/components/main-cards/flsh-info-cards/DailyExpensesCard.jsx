import React from "react";
// REMOVED: No longer need useState, useEffect, useCallback, useAuth, or supabase client here.
import { MiniCard } from "./MiniCard";
import { useCashoutTotal } from "./hooks/useCashoutTotal";

export function DailyExpensesCard({ onHide }) {
  const formatCurrency = (value) => {
    // Guard against non-numeric inputs to prevent errors.
    if (typeof value !== "number" || isNaN(value)) {
      return "";
    }
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  };
  const useCurrencyFormatter = formatCurrency({
    locale: "en-PH",
    currency: "PHP",
  });

  // 1. Get the synchronously calculated total from the client-side cashouts data.
  // This value is always up-to-date because CashoutProvider handles all updates.
  const cashoutTotal = useCashoutTotal();

  // 2. There is no need for local state like 'expensesValue' anymore.
  // We can directly render the value from the hook. This ensures that
  // any update in the CashoutProvider is instantly reflected here.

  return (
    <MiniCard
      title="Daily Expenses"
      // 3. Format the value from the hook directly in the render method.
      value={useCurrencyFormatter(cashoutTotal)}
      onHide={onHide}
    />
  );
}
