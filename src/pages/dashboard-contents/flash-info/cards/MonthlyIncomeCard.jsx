import React from "react";
import { MiniCard } from "../MiniCard"; // Adjust path if needed

export function MonthlyIncomeCard({ onHide }) {
  // This value is static for now.
  const monthlyIncome = "$25,600";

  return (
    <MiniCard title="Monthly Income" value={monthlyIncome} onHide={onHide} />
  );
}
