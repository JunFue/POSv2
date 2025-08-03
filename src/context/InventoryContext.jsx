import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "../features/pos-features/authentication/hooks/useAuth";
import { getInventory } from "../api/itemService";
import { usePageVisibility } from "../hooks/usePageVisibility";
// Import supabase client for real-time subscriptions
import { supabase } from "../utils/supabaseClient";

const CACHE_KEY = "inventoryData";
const CACHE_TTL_MS = 10 * 60 * 1000; // Cache inventory data for 10 minutes

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();
  const isVisible = usePageVisibility();

  const refreshInventory = useCallback(async () => {
    if (!session) {
      setInventory([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getInventory();
      setInventory(data);
      setError(null);
      const cacheData = { value: data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Effect for initial load from cache
  useEffect(() => {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setInventory(value);
        setLoading(false);
      }
    }
  }, []);

  // Effect for fetching/refreshing data based on session and visibility
  useEffect(() => {
    if (session && isVisible) {
      refreshInventory();
    }
  }, [session, isVisible, refreshInventory]);

  // --- TECHNIQUE RE-IMPLEMENTED FOR INSTANTANEOUS UPDATES ---
  // This new effect handles the real-time subscription.
  useEffect(() => {
    // Only subscribe if the user is authenticated.
    if (!session) return;

    const channel = supabase
      .channel("public:item_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_inventory" },
        (payload) => {
          console.log("Real-time inventory change received:", payload);
          const updatedItem = payload.new;

          // Perform a client-side merge for an instant UI update.
          // This is much faster than re-fetching the entire list.
          setInventory((prevInventory) => {
            const itemIndex = prevInventory.findIndex(
              (item) => item.id === updatedItem.id
            );
            // If the item already exists in our state, update it
            if (itemIndex > -1) {
              const newInventory = [...prevInventory];
              newInventory[itemIndex] = updatedItem;
              return newInventory;
            }
            // Otherwise, it's a new item, so add it to the list
            else {
              return [...prevInventory, updatedItem].sort((a, b) =>
                a.item_name.localeCompare(b.item_name)
              );
            }
          });
        }
      )
      .subscribe();

    // Cleanup function to remove the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]); // Re-subscribe if the user session changes.

  const getLiveQuantity = useCallback(
    (itemName) => {
      if (loading) return "Loading...";
      if (error) return "N/A";
      const item = inventory.find(
        (invItem) => invItem.item_name.toLowerCase() === itemName.toLowerCase()
      );
      return item ? item.quantity_available : 0;
    },
    [inventory, loading, error]
  );

  return (
    <InventoryContext.Provider
      value={{ inventory, loading, error, getLiveQuantity }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  return useContext(InventoryContext);
};
