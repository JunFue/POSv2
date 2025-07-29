import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../utils/supabaseClient";
import { getInventory } from "../api/itemService";

const InventoryContext = createContext();

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
        const data = await getInventory();
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
