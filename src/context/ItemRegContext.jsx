import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import { getItems } from "../api/itemService";
import { usePageVisibility } from "../hooks/usePageVisibility";

const CACHE_KEY = "itemRegistrationData";
const CACHE_TTL_MS = 15 * 60 * 1000; // Cache data for 15 minutes

const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const isVisible = usePageVisibility(); // Use the hook

  const refreshItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getItems();
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);

      const cacheData = {
        value: syncedItems,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // This effect handles the initial load from cache and user changes
  useEffect(() => {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setItems(value);
        setLoading(false);
      }
    }
    refreshItems();
  }, [refreshItems]);

  // --- TECHNIQUE IMPLEMENTED ---
  // This new effect handles re-fetching data when the tab becomes visible again,
  // ensuring the local data is a fresh copy of the database.
  useEffect(() => {
    if (isVisible) {
      console.log("Tab is visible, refreshing items to ensure data sync.");
      refreshItems();
    }
  }, [isVisible, refreshItems]);

  const addOptimisticItem = (item) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const updateItemStatus = (tempId, updatedData) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === tempId ? { ...item, ...updatedData } : item
      )
    );
  };

  return (
    <ItemRegData.Provider
      value={{
        items,
        refreshItems,
        serverOnline,
        loading,
        addOptimisticItem,
        updateItemStatus,
      }}
    >
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };
