import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";

import { io } from "socket.io-client";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function DailyExpensesCard({ onHide }) {
  const [expensesValue, setExpensesValue] = useState("Loading...");
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchDailyExpenses = useCallback(async () => {
    if (!token) {
      console.log("DailyExpensesCard: Waiting for auth token...");
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-daily-expenses?date=${today}`;

      const response = await fetch(url, {
        method: "GET",
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
  }, [fetchDailyExpenses]);

  useEffect(() => {
    const socket = io(BACKEND_URL);

    // Listen for a new 'cashout_update' event
    socket.on("cashout_update", () => {
      console.log(
        "DailyExpensesCard: Received 'cashout_update', refetching expenses."
      );
      fetchDailyExpenses();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDailyExpenses]);

  return (
    <MiniCard title="Daily Expenses" value={expensesValue} onHide={onHide} />
  );
}
