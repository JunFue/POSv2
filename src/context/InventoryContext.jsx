import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "../features/pos-features/authentication/hooks/useAuth";

const InventoryContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Provides a global state for inventory management, fetching initial data
 * from the server and keeping it updated in real-time with WebSockets.
 */
export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  useEffect(() => {
    /**
     * Fetches the initial list of inventory items from the backend API.
     * Requires an authenticated user session.
     */
    const fetchInitialInventory = async () => {
      if (!session?.access_token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
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

    // Establish WebSocket connection for real-time updates.
    const socket = io(BACKEND_URL);

    /**
     * Handles incoming 'inventory_update' events from the WebSocket server.
     * Updates an existing item or adds a new one to the inventory state.
     */
    socket.on("inventory_update", (updatedItem) => {
      setInventory((prevInventory) => {
        const itemIndex = prevInventory.findIndex(
          (item) =>
            item.item_name.toLowerCase() === updatedItem.item_name.toLowerCase()
        );
        if (itemIndex > -1) {
          // If item exists, update it
          const newInventory = [...prevInventory];
          newInventory[itemIndex] = updatedItem;
          return newInventory;
        } else {
          // If it's a new item, add it and sort the inventory
          return [...prevInventory, updatedItem].sort((a, b) =>
            a.item_name.localeCompare(b.item_name)
          );
        }
      });
    });

    // Disconnect the socket when the component unmounts.
    return () => {
      socket.disconnect();
    };
  }, [session]); // Rerun effect if the user session changes.

  /**
   * A memoized function to retrieve the current quantity of a specific item.
   * @param {string} itemName - The name of the item to look up.
   * @returns {number|string} The available quantity, or a status string.
   */
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

/**
 * Custom hook to easily access the inventory context.
 * @returns {object} The inventory context value.
 */
export const useInventory = () => {
  return useContext(InventoryContext);
};
