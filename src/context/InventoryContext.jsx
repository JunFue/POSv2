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

  // --- FIX: The data fetching logic is now self-contained in this useEffect hook ---
  useEffect(() => {
    // Define the function inside the effect to break the dependency loop.
    const refreshInventory = async () => {
      if (!session) {
        setInventory([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
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
    };

    // Only run the fetch if the user is logged in and the page is visible.
    if (session && isVisible) {
      refreshInventory();
    }
  }, [session, isVisible]); // The dependency array is now simple and safe.

  // This real-time subscription effect is correct and remains unchanged.
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("public:item_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_inventory" },
        (payload) => {
          const updatedItem = payload.new;
          setInventory((prevInventory) => {
            const itemIndex = prevInventory.findIndex(
              (item) => item.id === updatedItem.id
            );
            if (itemIndex > -1) {
              const newInventory = [...prevInventory];
              newInventory[itemIndex] = updatedItem;
              return newInventory;
            } else {
              return [...prevInventory, updatedItem].sort((a, b) =>
                a.item_name.localeCompare(b.item_name)
              );
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

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
