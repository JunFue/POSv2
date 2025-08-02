import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "../features/pos-features/authentication/hooks/useAuth";
import { getInventory } from "../api/itemService";
import { usePageVisibility } from "../hooks/usePageVisibility"; // Import the visibility hook

const CACHE_KEY = "inventoryData";
const CACHE_TTL_MS = 10 * 60 * 1000; // Cache inventory data for 10 minutes

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();
  const isVisible = usePageVisibility(); // Use the hook

  const refreshInventory = useCallback(async () => {
    // This check is now implicitly handled by getInventory via getAuthToken
    if (!session) {
      setInventory([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getInventory();
      setInventory(data);
      setError(null);

      // --- TECHNIQUE IMPLEMENTED ---
      // Cache the newly fetched data with a timestamp
      const cacheData = {
        value: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // This effect handles the initial load from cache and auth changes
  useEffect(() => {
    // --- TECHNIQUE IMPLEMENTED ---
    // On initial mount, try to load from cache first.
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      // Check if the cached data is still fresh
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setInventory(value);
        setLoading(false); // We have data, no need for a loading spinner
      }
    }
    // Always fetch fresh data when the session is available
    if (session) {
      refreshInventory();
    }
  }, [session, refreshInventory]);

  // --- TECHNIQUE IMPLEMENTED ---
  // This new effect handles re-fetching data when the tab becomes visible again
  useEffect(() => {
    if (isVisible && session) {
      console.log("Tab is visible, refreshing inventory to ensure data sync.");
      refreshInventory();
    }
  }, [isVisible, session, refreshInventory]);

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
