import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";

import { FaCalendarAlt } from "react-icons/fa";
import { IncomeRangeCalendar } from "./IncomeRangeCalendar";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/Useauth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function MonthlyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchMonthlyIncome = useCallback(
    async (range) => {
      if (!token) return;
      if (!range.from || !range.to) return;

      setIncomeValue("Loading...");

      try {
        const startDate = format(range.from, "yyyy-MM-dd");
        const endDate = format(range.to, "yyyy-MM-dd");

        const url = `${BACKEND_URL}/api/flash-info/net-income-range?startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const formattedIncome = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(data.totalNetIncome);

        setIncomeValue(formattedIncome);
      } catch (error) {
        console.error("MonthlyIncomeCard: Error fetching income:", error);
        setIncomeValue("Error");
      }
    },
    [token]
  );

  // Fetch initial data on load
  useEffect(() => {
    fetchMonthlyIncome(dateRange);
  }, [fetchMonthlyIncome]);

  const handleSetRange = (newRange) => {
    setDateRange(newRange);
    fetchMonthlyIncome(newRange);
    setIsCalendarOpen(false);
  };

  return (
    <div className="relative w-full h-full">
      <MiniCard title="Monthly Income" value={incomeValue} onHide={onHide}>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="absolute top-1 right-8 p-1 text-gray-400 hover:text-white"
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
