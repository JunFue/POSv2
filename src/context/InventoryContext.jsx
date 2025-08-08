import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "../features/AUTHENTICATION/hooks/useAuth";
import { getInventory } from "../api/itemService";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { supabase } from "../utils/supabaseClient";

const INVENTORY_STORAGE_KEY = "inventoryData";

const InventoryContext = createContext();

// Helper function to get the initial state from localStorage
const getInitialInventory = () => {
  try {
    const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const parsed = savedInventory ? JSON.parse(savedInventory) : [];
    // Ensure we always start with an array, even if localStorage is corrupted.
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse inventory from localStorage", error);
    return [];
  }
};

export function InventoryProvider({ children }) {
  // Initialize state directly from localStorage.
  const [inventory, setInventory] = useState(getInitialInventory);

  // The loading state is now only true if we have no initial data.
  const [loading, setLoading] = useState(inventory.length === 0);
  const [error, setError] = useState(null);
  const { session } = useAuth();
  const isVisible = usePageVisibility();

  // This effect runs ONLY when the inventory state changes, saving it to localStorage.
  useEffect(() => {
    // Only save to localStorage if inventory is an array
    if (Array.isArray(inventory)) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory]);

  // This effect handles fetching fresh data from the server.
  useEffect(() => {
    const refreshInventory = async () => {
      if (!session) {
        setInventory([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getInventory();

        // --- FIX ---
        // Validate that the fetched data is an array before setting the state.
        if (Array.isArray(data)) {
          setInventory(data);
          setError(null);
        } else {
          // If data is not an array, it's an unexpected response.
          // We log an error and don't update the inventory to prevent a crash.
          console.error("Fetched inventory data is not an array:", data);
          setError("Failed to load valid inventory data from the server.");
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError(err.message);
      } finally {
        // Ensure loading is false after the fetch attempt.
        setLoading(false);
      }
    };

    if (session && isVisible) {
      refreshInventory();
    }
  }, [session, isVisible]);

  // Real-time subscription for all subsequent inventory changes
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
            // Ensure we are only updating if the previous state is an array
            const currentInventory = Array.isArray(prevInventory)
              ? prevInventory
              : [];
            const itemIndex = currentInventory.findIndex(
              (item) => item.id === updatedItem.id
            );
            if (itemIndex > -1) {
              const newInventory = [...currentInventory];
              newInventory[itemIndex] = updatedItem;
              return newInventory;
            } else {
              return [...currentInventory, updatedItem].sort((a, b) =>
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
      if (Array.isArray(inventory)) {
        const item = inventory.find(
          (invItem) =>
            invItem.item_name.toLowerCase() === itemName.toLowerCase()
        );
        if (item) return item.quantity_available;
      }

      if (loading) return "Loading...";
      if (error) return "N/A";

      return 0;
    },
    [inventory, loading, error]
  );

  return (
    <InventoryContext.Provider
      value={{ inventory, setInventory, loading, error, getLiveQuantity }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  return useContext(InventoryContext);
};
