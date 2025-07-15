import React from "react";
import { MiniCard } from "../MiniCard"; // Adjust path if needed

export function DailyIncomeCard({ onHide }) {
  // This value is static for now, but you could add fetching logic here later.
  const dailyIncome = "$1,250";

  return <MiniCard title="Daily Income" value={dailyIncome} onHide={onHide} />;
}
