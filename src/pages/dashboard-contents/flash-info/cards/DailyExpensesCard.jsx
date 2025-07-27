import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function DailyExpensesCard({ onHide }) {
  const [expensesValue, setExpensesValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchDailyExpenses = useCallback(async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-daily-expenses?date=${today}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      const formattedExpenses = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalExpenses);

      setExpensesValue(formattedExpenses);
    } catch (error) {
      console.error("DailyExpensesCard: Error fetching daily expenses:", error);
      setExpensesValue("Error");
    }
  }, [token]);

  useEffect(() => {
    fetchDailyExpenses();

    // --- REVISED: Supabase Real-time Subscription ---
    const channel = supabase
      .channel("public:cashouts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cashouts" },
        () => {
          console.log(
            "DailyExpensesCard: Cashout change detected, refetching expenses."
          );
          fetchDailyExpenses();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDailyExpenses]);

  return (
    <MiniCard title="Daily Expenses" value={expensesValue} onHide={onHide} />
  );
}
