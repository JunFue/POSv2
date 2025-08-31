import React from "react";
// REMOVED: No longer need useState, useEffect, useCallback, useAuth, or supabase client here.
import { MiniCard } from "./MiniCard";
import { useCashoutTotal } from "./hooks/useCashoutTotal";
import { useCurrencyFormatter } from "../../../../utils/useCurrencyFormatter";

export function DailyExpensesCard({ onHide }) {
  const formatCurrency = useCurrencyFormatter({
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
      value={formatCurrency(cashoutTotal)}
      onHide={onHide}
    />
  );
}
