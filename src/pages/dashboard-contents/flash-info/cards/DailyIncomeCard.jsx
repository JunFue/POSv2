import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";

import { io } from "socket.io-client";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/Useauth";

export function DailyIncomeCard({ onHide }) {
  const [incomeValue, setIncomeValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchDailyIncome = useCallback(async () => {
    if (!token) {
      console.log("DailyIncomeCard: Waiting for auth token...");
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      // Use the new endpoint
      const url = `http://localhost:3000/api/flash-info/today-daily-income?date=${today}`;

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
      console.error("DailyIncomeCard: Error fetching daily income:", error);
      setIncomeValue("Error");
    }
  }, [token]);

  // Effect for the initial fetch
  useEffect(() => {
    fetchDailyIncome();
  }, [fetchDailyIncome]);

  // Effect for the Socket.IO connection
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("payment_update", () => {
      console.log(
        "DailyIncomeCard: Received 'payment_update', refetching income."
      );
      fetchDailyIncome();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDailyIncome]);

  return <MiniCard title="Daily Income" value={incomeValue} onHide={onHide} />;
}
