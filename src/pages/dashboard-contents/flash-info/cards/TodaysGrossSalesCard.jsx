import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function TodaysGrossSalesCard({ onHide }) {
  const [salesValue, setSalesValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchTotalSales = useCallback(async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-gross-sales?date=${today}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      const formattedSales = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalSales);

      setSalesValue(formattedSales);
    } catch (error) {
      console.error("GrossSalesCard: Error fetching total sales:", error);
      setSalesValue("Error");
    }
  }, [token]);

  useEffect(() => {
    fetchTotalSales();

    // --- REVISED: Supabase Real-time Subscription ---
    const channel = supabase
      .channel("public:payments:sales") // Use a unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          console.log(
            "GrossSalesCard: Payment change detected, refetching sales."
          );
          fetchTotalSales();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTotalSales]);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
