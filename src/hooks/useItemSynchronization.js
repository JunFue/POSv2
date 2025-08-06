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
  // --- NEW: A separate state for background syncs ---
  // isSyncing: For silent, non-blocking updates.
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Use a ref to prevent multiple simultaneous refreshes.
  const isRefreshing = useRef(false);

  // --- MODIFIED: refreshItems now handles two types of loading states ---
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

  // --- MODIFIED: The main useEffect for a smoother initial load ---
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
      // This makes the table appear instantly on page load.
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
      await refreshItems(true); // Pass `true` for a background refresh
    };

    setupAndLoad();

    // 4. The Supabase subscription for real-time updates.
    const channel = supabase
      .channel("public:items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        (payload) => {
          console.log("Change received from Supabase Broadcast!", payload);
          // When a change occurs, trigger a silent, background refresh.
          refreshItems(true); // Pass `true` here as well
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshItems]); // refreshItems is stable due to useCallback

  const addItem = useCallback(
    async (newItemData) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItemData, id: tempId, status: "pending" };

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
        await registerItem(newItemData);
        // SUCCESS: The Supabase subscription will trigger a background refresh automatically.
        // No need to call refreshItems() here.
      } catch (error) {
        console.error("Failed to add item, adding to queue:", error);
        addToQueue({ type: "CREATE_ITEM", payload: newItemData });
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
        saveItemsToCache(newItems, new Date().toISOString());
        return newItems;
      });

      if (!serverOnline) {
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
        return;
      }

      try {
        await apiDeleteItem(barcode);
        // SUCCESS: The Supabase subscription will trigger a background refresh.
      } catch (error) {
        console.error(
          "Failed to delete item, reverting and adding to queue:",
          error
        );
        setItems(originalItems);
        saveItemsToCache(originalItems, new Date().toISOString());
        addToQueue({ type: "DELETE_ITEM", payload: { barcode } });
      }
    },
    [items, serverOnline]
  );

  // --- MODIFIED: Return the new isSyncing state ---
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
