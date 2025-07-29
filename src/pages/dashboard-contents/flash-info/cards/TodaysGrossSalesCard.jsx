import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { supabase } from "../../../../utils/supabaseClient";
import { getTodaysGrossSales } from "../../../../api/dashboardService";

export function TodaysGrossSalesCard({ onHide }) {
  const [salesValue, setSalesValue] = useState("Loading...");

  const fetchSales = useCallback(async () => {
    try {
      const data = await getTodaysGrossSales();
      const formattedSales = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data.totalSales);
      setSalesValue(formattedSales);
    } catch (error) {
      console.error("GrossSalesCard: Error fetching total sales:", error);
      setSalesValue("Error");
    }
  }, []);

  useEffect(() => {
    fetchSales();
    const channel = supabase
      .channel("public:payments:sales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          fetchSales();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSales]);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
