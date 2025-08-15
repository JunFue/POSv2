import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniCard } from "./MiniCard";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { useSupabaseSubscription } from "../../../../hooks/useSupabaseSubscription";

// We get the backend URL from environment variables to avoid hardcoding.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function TodaysGrossSalesCard({ onHide }) {
  const queryKey = ["todaysGrossSales"];
  const queryClient = useQueryClient();
  // 2. Get the auth token from the useAuth hook.
  const { token } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKey,
    // 3. The fetching logic is now simpler and uses the token from the context.
    queryFn: async () => {
      if (!token) {
        throw new Error("User not authenticated.");
      }

      // Construct the API endpoint URL
      const today = new Date().toISOString().slice(0, 10);
      const url = `${BACKEND_URL}/api/flash-info/today-gross-sales?date=${today}`;

      // Fetch the data
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    },
    // 4. Add 'token' as a dependency. React Query will only run this query if the token exists.
    enabled: !!token,
  });

  // The real-time subscription logic remains the same.
  useSupabaseSubscription("public:payments:sales", "payments", () => {
    queryClient.invalidateQueries({ queryKey: queryKey });
  });

  const salesValue = isLoading
    ? "Loading..."
    : isError
    ? "Error"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(data?.totalSales || 0);

  return (
    <MiniCard title="Today's Gross Sales" value={salesValue} onHide={onHide} />
  );
}
