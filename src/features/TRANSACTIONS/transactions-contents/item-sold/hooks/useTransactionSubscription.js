import { useEffect } from "react";
import { supabase } from "../../../../../utils/supabaseClient";

/**
 * A custom hook that subscribes to real-time changes in the 'transactions' table.
 * @param {function} onDataChange - A callback function to execute when a change (insert, update, delete) is detected.
 * This is typically used to trigger a refetch of the data.
 */
export function useTransactionSubscription(onDataChange) {
  useEffect(() => {
    // A subscription requires a channel. You can think of this as a chat room.
    const channel = supabase
      .channel("transactions-realtime-channel")
      .on(
        "postgres_changes", // This is the event type for database changes.
        {
          event: "*", // Listen for all events: INSERT, UPDATE, DELETE.
          schema: "public",
          table: "transactions", // The table to monitor.
        },
        (payload) => {
          // This function runs every time a change is detected.
          console.log("Database change received!", payload);
          // Call the provided callback to let the component know it should refetch data.
          onDataChange();
        }
      )
      .subscribe(); // Finally, connect to the channel.

    // This is the cleanup function that runs when the component unmounts.
    // It's crucial to remove the channel to prevent memory leaks.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDataChange]); // The effect will re-run if the onDataChange function changes.
}
