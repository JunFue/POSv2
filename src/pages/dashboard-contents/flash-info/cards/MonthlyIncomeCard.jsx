import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { FaCalendarAlt } from "react-icons/fa";
import { IncomeRangeCalendar } from "./IncomeRangeCalendar";
import { startOfMonth, endOfMonth } from "date-fns";
import { getMonthlyIncome } from "../../../../api/dashboardService";

export function MonthlyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const fetchIncome = useCallback(async (range) => {
    if (!range.from || !range.to) return;
    setIncomeValue("Loading...");
    try {
      const data = await getMonthlyIncome(range);
      const formattedIncome = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalNetIncome);
      setIncomeValue(formattedIncome);
    } catch (error) {
      console.error("MonthlyIncomeCard: Error fetching income:", error);
      setIncomeValue("Error");
    }
  }, []);

  useEffect(() => {
    fetchIncome(dateRange);
  }, [fetchIncome, dateRange]);

  const handleSetRange = (newRange) => {
    setDateRange(newRange);
    setIsCalendarOpen(false);
  };

  return (
    <div className="relative w-full h-full">
      <MiniCard title="Monthly Income" value={incomeValue} onHide={onHide}>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="absolute top-1 right-8 p-1 text-gray-400 hover:text-body-text"
          title="Select Date Range"
        >
          <FaCalendarAlt size={12} />
        </button>
      </MiniCard>
      {isCalendarOpen && (
        <IncomeRangeCalendar onSet={handleSetRange} initialRange={dateRange} />
      )}
    </div>
  );
}
