import { useState, useEffect, useCallback, useRef } from "react";
import {
  getItems,
  registerItem,
  deleteItem as apiDeleteItem,
} from "../api/itemService";
import {
  saveItemsToCache,
  loadItemsFromCache,
  clearItemsCache,
} from "../services/itemCacheService";
import {
  addToQueue,
  clearQueue,
  processMutationQueue,
} from "../services/mutationQueueService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * A robust hook to manage item data synchronization with a backend server.
 * This final version uses a useRef to create a persistent SSE connection
 * that is resilient to React Strict Mode's re-renders in development.
 *
 * @param {string} userId - The ID of the current user.
 * @returns {object} The state and methods for managing item data.
 */
export const useItemSynchronization = (userId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const isRefreshing = useRef(false);
  // --- CHANGE: Store the EventSource in a ref to make it persistent ---
  const eventSourceRef = useRef(null);

  const refreshItems = useCallback(async () => {
    if (!userId || isRefreshing.current) return;

    isRefreshing.current = true;
    setLoading(true);
    try {
      const data = await getItems();
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);

      const response = await fetch(`${BACKEND_URL}/api/status/stocks`);
      const serverStatus = await response.json();
      localStorage.setItem("itemCacheTimestamp", serverStatus.lastUpdatedAt);
      saveItemsToCache(syncedItems, serverStatus.lastUpdatedAt);
    } catch (error) {
      console.error("Error during item refresh:", error.message);
      setServerOnline(false);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, [userId]);

  /**
   * EFFECT: Manages the entire data synchronization lifecycle for a user session.
   */
  useEffect(() => {
    if (!userId) {
      setItems([]);
      clearItemsCache();
      clearQueue();
      setLoading(true);
      // Ensure any existing connection is closed on logout
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // --- CHANGE: Only establish connection if one doesn't already exist ---
    if (!eventSourceRef.current) {
      const setupAndLoad = async () => {
        console.log("Establishing SSE connection to /api/status/stream");
        const eventSource = new EventSource(`${BACKEND_URL}/api/status/stream`);
        eventSourceRef.current = eventSource; // Store it in the ref

        eventSource.onopen = () => {
          console.log("SSE connection successful.");
          setServerOnline(true);
        };

        eventSource.addEventListener("update", () => {
          console.log('SSE "update" event received, triggering data refresh.');
          refreshItems();
        });

        eventSource.onerror = () => {
          console.error("SSE connection error.");
          setServerOnline(false);
          eventSource.close();
          eventSourceRef.current = null; // Clear the ref on error
        };

        const cachedData = loadItemsFromCache();
        if (cachedData) {
          setItems(cachedData.value);
        }
        try {
          await processMutationQueue({
            registerItem,
            deleteItem: apiDeleteItem,
          });
        } catch {
          setServerOnline(false);
        }
        await refreshItems();
      };

      setupAndLoad();
    }

    // The cleanup function will run when the component unmounts (e.g., user logs out)
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing SSE connection for user session.");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [userId, refreshItems]);

  // --- Optimistic Mutation Logic (No changes needed) ---

  const addItem = useCallback(
    async (newItemData) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItemData, id: tempId, status: "pending" };

      setItems((currentItems) => {
        const newItems = [optimisticItem, ...currentItems];
        saveItemsToCache(newItems, localStorage.getItem("itemCacheTimestamp"));
        return newItems;
      });

      if (!serverOnline) {
        addToQueue({
          type: "CREATE_ITEM",
          payload: { ...newItemData, tempId },
        });
        return;
      }

      try {
        await registerItem(newItemData);
      } catch {
        addToQueue({
          type: "CREATE_ITEM",
          payload: { ...newItemData, tempId },
        });
      }
    },
    [serverOnline]
  );

  const deleteItem = useCallback(
    async (barcode) => {
      const originalItems = [...items];

      setItems((currentItems) => {
        const newItems = currentItems.filter(
          (item) => item.barcode !== barcode
        );
        saveItemsToCache(newItems, localStorage.getItem("itemCacheTimestamp"));
        return newItems;
      });

      if (!serverOnline) {
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
        return;
      }

      try {
        await apiDeleteItem(barcode);
      } catch {
        setItems(originalItems);
        saveItemsToCache(
          originalItems,
          localStorage.getItem("itemCacheTimestamp")
        );
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
      }
    },
    [items, serverOnline]
  );

  return { items, loading, serverOnline, addItem, deleteItem, refreshItems };
};
