import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { supabase } from "../../../../utils/supabaseClient";
import { getDailyIncome } from "../../../../api/dashboardService";

const CACHE_KEY = "dailyIncome";

export function DailyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");

  const fetchIncome = useCallback(async () => {
    try {
      const data = await getDailyIncome();
      const formattedIncome = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalNetIncome);
      setIncomeValue(formattedIncome);
      // Cache the new value
      localStorage.setItem(CACHE_KEY, formattedIncome);
    } catch (error) {
      console.error("DailyIncomeCard: Error fetching daily income:", error);
      setIncomeValue("Error");
    }
  }, []);

  useEffect(() => {
    // Load from cache on first mount
    const cachedIncome = localStorage.getItem(CACHE_KEY);
    if (cachedIncome) {
      setIncomeValue(cachedIncome);
    }

    // Fetch latest data
    fetchIncome();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("public:payments:income")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          fetchIncome();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncome]);

  return <MiniCard title="Daily Income" value={incomeValue} onHide={onHide} />;
}
