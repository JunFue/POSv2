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
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const isRefreshing = useRef(false);

  const refreshItems = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!userId || isRefreshing.current) return;
      isRefreshing.current = true;
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
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
      const cachedData = loadItemsFromCache();
      if (cachedData) {
        setItems(cachedData.value);
      }
      setLoading(false);

      try {
        await processMutationQueue({ registerItem, deleteItem: apiDeleteItem });
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
      await refreshItems(true);
    };
    setupAndLoad();

    // --- This is the simplified listener ---
    // It listens directly for any INSERT, UPDATE, or DELETE on the 'items' table.
    const channel = supabase
      .channel("public:items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        (payload) => {
          console.log("Database change received!", payload);
          // When a change occurs, trigger a silent, background refresh.
          refreshItems(true);
        }
      )
      .subscribe();
    // --- End of listener ---

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshItems]);

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
        const savedItem = await registerItem(newItemData);

        setItems((currentItems) => {
          const newItems = currentItems.map((item) =>
            item.id === tempId ? { ...savedItem, status: "synced" } : item
          );
          saveItemsToCache(newItems, new Date().toISOString());
          return newItems;
        });
      } catch (error) {
        console.error(
          "[addItem Hook] Error received during registration:",
          error
        );
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
