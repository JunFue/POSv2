import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { supabase } from "../../../../utils/supabaseClient";
import { getDailyIncome } from "../../../../api/dashboardService";

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
    } catch (error) {
      console.error("DailyIncomeCard: Error fetching daily income:", error);
      setIncomeValue("Error");
    }
  }, []);

  useEffect(() => {
    fetchIncome();
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
