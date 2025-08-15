import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // Adjust the import path as needed

/**
 * A custom hook to subscribe to real-time changes in a Supabase table.
 * @param {string} channelName - A unique name for the subscription channel.
 * @param {string} table - The name of the table to listen to.
 * @param {Function} callback - The function to call when a change is detected.
 */
export const useSupabaseSubscription = (channelName, table, callback) => {
  useEffect(() => {
    // Ensure the callback is a function before proceeding
    if (typeof callback !== "function") {
      console.error(
        "useSupabaseSubscription: The provided callback is not a function."
      );
      return;
    }

    // Create a unique channel for the subscription.
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: table },
        (payload) => {
          // When a change occurs, execute the callback function.
          console.log(`Change detected on ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription when the component unmounts.
    return () => {
      supabase.removeChannel(channel);
    };
    // The effect dependencies ensure the subscription is stable and doesn't re-run unnecessarily.
  }, [channelName, table, callback]);
};
