import React from "react";
import { MiniCard } from "./MiniCard";
import { useCashoutTotal } from "./hooks/useCashoutTotal";
// 1. Import the shared currency formatter function
import { formatCurrency } from "./formatter.js";

export function DailyExpensesCard({ onHide }) {
  // 2. Get the total from the custom hook
  const cashoutTotal = useCashoutTotal();

  // The component is now much simpler.
  // It gets the value and formats it directly in the return statement.
  return (
    <MiniCard
      title="Daily Expenses"
      // 3. Format the value directly using the imported function
      value={formatCurrency(cashoutTotal)}
      onHide={onHide}
    />
  );
}
