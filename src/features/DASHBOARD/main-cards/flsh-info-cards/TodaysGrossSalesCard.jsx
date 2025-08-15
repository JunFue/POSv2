import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniCard } from "./MiniCard";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { useSupabaseSubscription } from "../../../../hooks/useSupabaseSubscription";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// Use a key to store the raw data object from the API.
const CACHE_KEY = "todaysGrossSalesData";

// Helper function to safely get and parse data from localStorage.
const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Failed to parse cached sales data:", e);
      return undefined; // Return undefined if parsing fails.
    }
  }
  return undefined;
};

export function TodaysGrossSalesCard({ onHide }) {
  const queryKey = ["todaysGrossSales"];
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
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
    enabled: !!token,
    // 1. Show placeholder data on initial load.
    // This data is displayed immediately while the actual query runs in the background.
    placeholderData: getCachedData(),
    // 2. When new data is fetched successfully, update our localStorage cache.
    onSuccess: (freshData) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    },
  });

  // 3. This part remains unchanged. It correctly triggers a refetch on live updates.
  useSupabaseSubscription("public:payments:sales", "payments", () => {
    queryClient.invalidateQueries({ queryKey: queryKey });
  });

  // Use the placeholder data if the query is loading for the first time.
  const displayData = data || getCachedData();

  const salesValue =
    isLoading && !displayData
      ? "Loading..."
      : isError
      ? "Error"
      : new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(displayData?.totalSales || 0);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
