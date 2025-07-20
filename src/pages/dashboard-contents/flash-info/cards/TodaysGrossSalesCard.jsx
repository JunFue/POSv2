import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard"; // Adjust path if MiniCard is located elsewhere

import { io } from "socket.io-client";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/Useauth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function TodaysGrossSalesCard({ onHide }) {
  const [salesValue, setSalesValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchTotalSales = useCallback(async () => {
    if (!token) {
      console.log("GrossSalesCard: Waiting for auth token...");
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      // FIX: Update URL to be more specific
      const url = `${BACKEND_URL}/api/flash-info/today-gross-sales?date=${today}`;

      const response = await fetch(url, {
        method: "GET",
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

  // Effect for the initial fetch
  useEffect(() => {
    fetchTotalSales();
  }, [fetchTotalSales]);

  // Effect for the Socket.IO connection
  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on("payment_update", () => {
      console.log(
        "GrossSalesCard: Received 'payment_update', refetching sales."
      );
      fetchTotalSales();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchTotalSales]);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
