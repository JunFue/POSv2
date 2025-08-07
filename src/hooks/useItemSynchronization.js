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
import { supabase } from "../utils/supabaseClient";

export const useItemSynchronization = (userId) => {
  const [items, setItems] = useState([]);
  // loading: For the initial, full-screen load.
  const [loading, setLoading] = useState(true);
  // isSyncing: For silent, non-blocking updates.
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Use a ref to prevent multiple simultaneous refreshes.
  const isRefreshing = useRef(false);

  const refreshItems = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!userId || isRefreshing.current) return;

      isRefreshing.current = true;
      // Only show the main loading screen if it's not a background refresh
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        // Otherwise, use the non-intrusive syncing indicator
        setIsSyncing(true);
      }

      try {
        const data = await getItems();
        const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
        setItems(syncedItems);
        setServerOnline(true);
        saveItemsToCache(syncedItems, new Date().toISOString());
      } catch (error) {
        console.error("Error during item refresh:", error.message);
        setServerOnline(false);
      } finally {
        // Clear all loading/syncing states
        isRefreshing.current = false;
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) {
      setItems([]);
      clearItemsCache();
      clearQueue();
      setLoading(true);
      return;
    }

    const setupAndLoad = async () => {
      // 1. Load from cache immediately and finish initial loading.
      const cachedData = loadItemsFromCache();
      if (cachedData) {
        setItems(cachedData.value);
      }
      setLoading(false); // End the main loading state here!

      // 2. Process the offline queue in the background.
      try {
        await processMutationQueue({ registerItem, deleteItem: apiDeleteItem });
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }

      // 3. Refresh data in the background without a loading screen.
      await refreshItems(true);
    };

    setupAndLoad();

    // 4. The Supabase subscription for REAL-TIME UPDATES FOR THE SAME USER
    // Create a unique channel name for the user
    const userChannelName = `user-items-${userId}`;

    const channel = supabase
      // Listen on the user-specific channel, not the public one
      .channel(userChannelName, {
        config: {
          broadcast: {
            // IMPORTANT: Acknowledge broadcasts from other clients/tabs
            self: true,
          },
        },
      })
      .on("broadcast", { event: "items_updated" }, (payload) => {
        console.log("User-specific broadcast received!", payload);
        // When a change occurs, trigger a silent, background refresh.
        refreshItems(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshItems]); // refreshItems is stable due to useCallback

  const addItem = useCallback(
    async (newItemData) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItemData, id: tempId, status: "pending" };

      // 1. Optimistically add the item to the UI with a "pending" status.
      setItems((currentItems) => {
        const newItems = [optimisticItem, ...currentItems];
        saveItemsToCache(newItems, new Date().toISOString());
        return newItems;
      });

      if (!serverOnline) {
        addToQueue({ type: "CREATE_ITEM", payload: newItemData });
        return;
      }

      try {
        // 2. Send the request to the server.
        const savedItem = await registerItem(newItemData);
        // 3. On success, find the temporary item and update its status to "synced".
        // This avoids a full refresh and provides an instant "sent" confirmation.
        setItems((currentItems) => {
          const newItems = currentItems.map((item) =>
            item.id === tempId ? { ...savedItem, status: "synced" } : item
          );
          saveItemsToCache(newItems, new Date().toISOString());
          return newItems;
        });
      } catch (error) {
        console.error("Failed to add item, adding to queue:", error);
        // If the API call fails, the item remains in a "pending" state
        // and is added to the queue for a later retry.
        addToQueue({ type: "CREATE_ITEM", payload: newItemData });
      }
    },
    [serverOnline] // No longer depends on refreshItems
  );

  const deleteItem = useCallback(
    async (barcode) => {
      const originalItems = [...items];
      // 1. Optimistically remove the item from the UI.
      setItems((currentItems) => {
        const newItems = currentItems.filter(
          (item) => item.barcode !== barcode
        );
        saveItemsToCache(newItems, new Date().toISOString());
        return newItems;
      });

      if (!serverOnline) {
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
        return;
      }

      try {
        // 2. Send the delete request.
        await apiDeleteItem(barcode);
        // 3. On success, we do nothing. The optimistic removal is now final.
        // No refresh is needed.
      } catch (error) {
        console.error(
          "Failed to delete item, reverting and adding to queue:",
          error
        );
        // If the API call fails, revert the change and add to the queue.
        setItems(originalItems);
        saveItemsToCache(originalItems, new Date().toISOString());
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
      }
    },
    [items, serverOnline] // No longer depends on refreshItems
  );

  return {
    items,
    loading,
    isSyncing,
    serverOnline,
    addItem,
    deleteItem,
    refreshItems,
  };
};
