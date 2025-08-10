import { useEffect, useCallback, useContext } from "react";
import { useAuth } from "../../../../AUTHENTICATION/hooks/useAuth";
import { ItemSoldContext } from "../../../../../context/ItemSoldContext";
import { supabase } from "../../../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useTodaysItemsSold() {
  const { session } = useAuth();
  const { todaysItemSold, setTodaysItemSold } = useContext(ItemSoldContext);

  const fetchTodaysData = useCallback(async () => {
    if (!session) return;

    const today = new Date().toISOString().split("T")[0];
    const url = `${BACKEND_URL}/api/by-date?date=${today}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTodaysItemSold(data);
        console.log("Fetched and updated today's items sold.");
        console.log(todaysItemSold);
      } else {
        console.error("Failed to fetch today's data from server.");
      }
    } catch (error) {
      console.error("Error fetching today's items sold:", error);
    }
  }, [session, setTodaysItemSold]);

  useEffect(() => {
    if (!session) return;

    // Initial fetch on mount
    fetchTodaysData();

    // Set up real-time subscription
    const channel = supabase
      .channel("public:transactions:todays-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          console.log(
            "Change received from Supabase, refetching today's data:",
            payload
          );
          fetchTodaysData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchTodaysData]);
}
