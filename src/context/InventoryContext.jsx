import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
// REMOVED: No longer need socket.io-client
// import { io } from "socket.io-client";
import { useAuth } from "../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../utils/supabaseClient";

const InventoryContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchInitialInventory = async () => {
      if (!session?.access_token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // This initial fetch remains the same
        const response = await fetch(`${BACKEND_URL}/api/inventory`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch inventory from server.");
        }
        const data = await response.json();
        setInventory(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching initial inventory:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialInventory();

    // --- REVISED: Supabase Real-time Subscription ---
    const channel = supabase
      .channel("public:item_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_inventory" },
        (payload) => {
          console.log("Inventory change received!", payload);
          const updatedItem = payload.new;
          setInventory((prevInventory) => {
            const itemIndex = prevInventory.findIndex(
              (item) => item.id === updatedItem.id
            );
            if (itemIndex > -1) {
              // If item exists, update it
              const newInventory = [...prevInventory];
              newInventory[itemIndex] = updatedItem;
              return newInventory;
            } else {
              // If it's a new item, add it
              return [...prevInventory, updatedItem].sort((a, b) =>
                a.item_name.localeCompare(b.item_name)
              );
            }
          });
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription when the component unmounts
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
