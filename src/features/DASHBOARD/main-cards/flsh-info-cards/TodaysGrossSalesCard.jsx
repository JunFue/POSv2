import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniCard } from "./MiniCard";
import { useSupabaseSubscription } from "../../../../hooks/useSupabaseSubscription";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CACHE_KEY = "todaysGrossSalesData";

const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Failed to parse cached sales data:", e);
      return undefined;
    }
  }
  return undefined;
};

export function TodaysGrossSalesCard({ onHide }) {
  const { token } = useAuth();
  // --- FIX: Make the queryKey dependent on the token ---
  // This tells React Query that this query is unique to the current user's session.
  // If the token is null or changes, React Query will treat it as a new query.
  const queryKey = ["todaysGrossSales", token];
  const queryClient = useQueryClient();

  const { data, isError } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      // This check is still useful as a safeguard.
      if (!token) throw new Error("User not authenticated.");

      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-gross-sales?date=${today}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      return response.json();
    },
    // This ensures the query doesn't run until the token is available.
    enabled: !!token,
    initialData: getCachedData(),
    onSuccess: (freshData) => {
      // We'll also make the localStorage key user-specific to avoid cache collisions
      // between different users on the same browser.
      if (token) {
        localStorage.setItem(
          `${CACHE_KEY}-${token}`,
          JSON.stringify(freshData)
        );
      }
    },
  });

  useSupabaseSubscription("public:payments:sales", "payments", () => {
    queryClient.invalidateQueries({ queryKey: queryKey });
  });

  const salesValue = isError
    ? "Error"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data?.totalSales || 0);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
