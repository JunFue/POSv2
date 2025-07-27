import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function DailyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchDailyIncome = useCallback(async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-daily-income?date=${today}`;

      const response = await fetch(url, {
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
      console.error("DailyIncomeCard: Error fetching daily income:", error);
      setIncomeValue("Error");
    }
  }, [token]);

  useEffect(() => {
    fetchDailyIncome();

    // --- REVISED: Supabase Real-time Subscription ---
    const channel = supabase
      .channel("public:payments:income") // Use a unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          console.log(
            "DailyIncomeCard: Payment change detected, refetching income."
          );
          fetchDailyIncome();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDailyIncome]);

  return <MiniCard title="Daily Income" value={incomeValue} onHide={onHide} />;
}
