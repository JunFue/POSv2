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
  getFullQueue,
  clearQueue,
} from "../services/mutationQueueService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const ITEM_STATUS_ENDPOINT = `${BACKEND_URL}/api/status/stocks`;

export const useItemSynchronization = (userId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const checkedUserIdRef = useRef(null);

  const refreshItems = useCallback(async () => {
    if (!userId) return;
    console.log("Manual refresh triggered.");
    try {
      setLoading(true);
      const data = await getItems();
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);

      const response = await fetch(ITEM_STATUS_ENDPOINT);
      const serverStatus = await response.json();
      // This is now the ONLY place a new timestamp is fetched and saved.
      saveItemsToCache(syncedItems, serverStatus.lastUpdatedAt);
    } catch (error) {
      console.error("Error during manual refresh:", error.message);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const processMutationQueue = useCallback(async () => {
    // ... (This logic remains the same)
    const queuedMutations = getFullQueue();
    if (queuedMutations.length === 0) return;

    console.log(`Processing ${queuedMutations.length} queued mutations.`);

    for (const mutation of queuedMutations) {
      try {
        if (mutation.type === "CREATE_ITEM") {
          const savedItem = await registerItem(mutation.payload);
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === mutation.payload.tempId
                ? { ...item, ...savedItem, status: "synced" }
                : item
            )
          );
        }
        if (mutation.type === "DELETE_ITEM") {
          await apiDeleteItem(mutation.payload.barcode);
        }
      } catch (error) {
        console.error("Failed to process a queued mutation:", error);
        return;
      }
    }

    clearQueue();
    console.log("Mutation queue successfully processed and cleared.");
    await refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    // ... (This logic remains the same)
    if (!userId) {
      if (checkedUserIdRef.current !== null) {
        setItems([]);
        setLoading(false);
        clearItemsCache();
        clearQueue();
        checkedUserIdRef.current = null;
      }
      return;
    }

    if (checkedUserIdRef.current === userId) return;
    checkedUserIdRef.current = userId;

    const loadAndCheckItems = async () => {
      setLoading(true);
      const cachedData = loadItemsFromCache();
      if (cachedData) {
        setItems(cachedData.value);
      }
      setLoading(false);

      try {
        const response = await fetch(ITEM_STATUS_ENDPOINT);
        if (!response.ok) throw new Error("Server status check failed");

        const serverStatus = await response.json();
        const serverLastUpdate = new Date(serverStatus.lastUpdatedAt).getTime();
        const localCacheTimestamp = cachedData
          ? new Date(cachedData.timestamp).getTime()
          : 0;

        // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
        console.log("CACHE VALIDATION:", {
          local: new Date(localCacheTimestamp).toLocaleString(),
          server: new Date(serverLastUpdate).toLocaleString(),
          isStale: serverLastUpdate > localCacheTimestamp,
        });

        setServerOnline(true);

        await processMutationQueue();

        if (serverLastUpdate > localCacheTimestamp) {
          console.log("Stale data detected. Refreshing items from server.");
          await refreshItems();
        } else {
          console.log("Local cache is fresh. No refresh needed.");
        }
      } catch (error) {
        console.error("Failed to check item status:", error.message);
        setServerOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadAndCheckItems();
  }, [userId, processMutationQueue, refreshItems]);

  const addItem = useCallback(
    async (newItemData) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItemData, id: tempId, status: "pending" };

      // Update state and cache together, preserving the timestamp
      const cachedData = loadItemsFromCache();
      setItems((currentItems) => {
        const newItems = [optimisticItem, ...currentItems];
        saveItemsToCache(newItems, cachedData?.timestamp); // Preserve existing timestamp
        return newItems;
      });

      if (!serverOnline) {
        console.log("Server offline. Queuing item creation.");
        addToQueue({
          type: "CREATE_ITEM",
          payload: { ...newItemData, tempId },
        });
        return;
      }

      try {
        const savedItem = await registerItem(newItemData);
        // After success, update the specific item in the UI
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === tempId
              ? { ...item, ...savedItem, status: "synced" }
              : item
          )
        );
        // Note: We do NOT save to cache again here, as the list is already updated.
        // The timestamp will be synced on the next refresh.
      } catch (error) {
        console.error(
          "Failed to create item while online. Adding to queue.",
          error
        );
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

      // Update state and cache together, preserving the timestamp
      const cachedData = loadItemsFromCache();
      setItems((currentItems) => {
        const newItems = currentItems.filter(
          (item) => item.barcode !== barcode
        );
        // Strictly preserve the existing timestamp from the cache
        saveItemsToCache(newItems, cachedData?.timestamp);
        return newItems;
      });

      if (!serverOnline) {
        console.log("Server offline. Queuing item deletion.");
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
        return;
      }

      try {
        await apiDeleteItem(barcode);
      } catch (error) {
        console.error(
          "Failed to delete item online. Reverting UI and queuing.",
          error
        );
        // Revert UI and cache to their previous state
        setItems(originalItems);
        saveItemsToCache(originalItems, cachedData?.timestamp); // Preserve timestamp on revert
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
      }
    },
    [items, serverOnline]
  );

  return { items, loading, serverOnline, addItem, deleteItem, refreshItems };
};
