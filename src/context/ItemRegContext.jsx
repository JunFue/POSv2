import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AuthContext } from "./AuthContext";
import { getItems } from "../api/itemService";

// --- CONSTANTS ---
const CACHE_KEY = "itemRegistrationData";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const ITEM_STATUS_ENDPOINT = `${BACKEND_URL}/api/status/stocks`;

// Create the context that will be provided to other components.
const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  // --- STATE MANAGEMENT ---
  const [items, setItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- HOOKS ---
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const checkedUserIdRef = useRef(null);

  /**
   * This effect is now immune to re-render loops from parent components.
   * It uses a ref to ensure the data check runs exactly once per user login.
   */
  useEffect(() => {
    if (!userId) {
      if (checkedUserIdRef.current !== null) {
        setItems([]);
        setLoading(false);
        checkedUserIdRef.current = null;
      }
      return;
    }

    if (checkedUserIdRef.current === userId) {
      return;
    }

    checkedUserIdRef.current = userId;

    const loadAndCheckItems = async () => {
      setLoading(true);

      const cachedItem = localStorage.getItem(CACHE_KEY);
      if (cachedItem) {
        const { value } = JSON.parse(cachedItem);
        setItems(value);
      }
      setLoading(false);

      try {
        const response = await fetch(ITEM_STATUS_ENDPOINT);
        if (!response.ok) throw new Error("Server status check failed");

        const serverStatus = await response.json();
        const serverLastUpdate = serverStatus.lastUpdatedAt;

        const localCacheTimestamp = cachedItem
          ? JSON.parse(cachedItem).timestamp
          : 0;

        if (serverLastUpdate > localCacheTimestamp) {
          console.log("Stale data detected. Refreshing items from server.");
          setLoading(true);
          const data = await getItems();
          const syncedItems = data.map((item) => ({
            ...item,
            status: "synced",
          }));
          setItems(syncedItems);

          // --- THE FIX ---
          // Use the server's timestamp as the new cache timestamp.
          // This synchronizes the cache version with the server's state.
          const cacheData = {
            value: syncedItems,
            timestamp: serverLastUpdate, // Use the timestamp that triggered the update
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } else {
          console.log("Local cache is fresh. No refresh needed.");
        }
        setServerOnline(true);
      } catch (error) {
        console.error("Failed to check item status:", error.message);
        setServerOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadAndCheckItems();
  }, [userId]);

  /**
   * A manual refresh function, exposed for UI buttons.
   */
  const refreshItems = useCallback(async () => {
    if (!userId) return;
    console.log("Manual refresh triggered.");
    try {
      setLoading(true);
      const data = await getItems();
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);
      // Also update the cache with the latest server timestamp on manual refresh
      const response = await fetch(ITEM_STATUS_ENDPOINT);
      const serverStatus = await response.json();
      const cacheData = {
        value: syncedItems,
        timestamp: serverStatus.lastUpdatedAt,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error during manual refresh:", error.message);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // --- OPTIMISTIC UI FUNCTIONS (MEMOIZED) ---
  const addOptimisticItem = useCallback((item) => {
    setItems((currentItems) => [item, ...currentItems]);
  }, []);

  const updateItemStatus = useCallback((tempId, updatedData) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === tempId ? { ...item, ...updatedData } : item
      )
    );
  }, []);

  // --- PERFORMANCE OPTIMIZATION ---
  const contextValue = useMemo(
    () => ({
      items,
      refreshItems,
      serverOnline,
      loading,
      addOptimisticItem,
      updateItemStatus,
    }),
    [
      items,
      loading,
      serverOnline,
      refreshItems,
      addOptimisticItem,
      updateItemStatus,
    ]
  );

  return (
    <ItemRegData.Provider value={contextValue}>{children}</ItemRegData.Provider>
  );
}

export { ItemRegData };
