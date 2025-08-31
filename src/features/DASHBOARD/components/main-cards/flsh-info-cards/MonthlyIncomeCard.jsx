import React, { useState, useEffect, useCallback } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IncomeRangeCalendar } from "./IncomeRangeCalendar";
import { startOfMonth, endOfMonth } from "date-fns";

import { MiniCard } from "./MiniCard";
import { getMonthlyIncome } from "../../../../../api/dashboardService";
import { supabase } from "../../../../../utils/supabaseClient";

export function MonthlyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const fetchIncome = useCallback(async (range) => {
    if (!range.from || !range.to) return;
    // --- FIXED: Do not set to "Loading..." here if a cached value might be displayed ---
    try {
      const data = await getMonthlyIncome(range);
      const formattedIncome = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalNetIncome);
      setIncomeValue(formattedIncome);

      // Cache the value with a dynamic key based on the date range
      const cacheKey = `monthlyIncome-${range.from.toISOString()}-${range.to.toISOString()}`;
      localStorage.setItem(cacheKey, formattedIncome);
    } catch (error) {
      console.error("MonthlyIncomeCard: Error fetching income:", error);
      setIncomeValue("Error");
    }
  }, []);

  useEffect(() => {
    // Load from cache on first mount
    const cacheKey = `monthlyIncome-${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`;
    const cachedIncome = localStorage.getItem(cacheKey);
    if (cachedIncome) {
      setIncomeValue(cachedIncome);
    }

    // Fetch latest data in the background
    fetchIncome(dateRange);

    // Subscribe to real-time changes
    const channel = supabase
      .channel("public:payments:monthly_income")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          // Refetch data for the current date range when any payment changes
          fetchIncome(dateRange);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
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
