import { useState, useEffect, useCallback, useRef } from "react";
import {
  getStocks,
  addStockRecord,
  updateStockRecord,
  deleteStockRecord,
} from "../../../../api/stocksService"; // Adjust path as needed
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient"; // Adjust path as needed

// We will create these new services in the next steps
import {
  saveStocksToCache,
  loadStocksFromCache,
  clearStocksCache,
} from "../services/stockCacheService";
import {
  addToStockQueue,
  processStockMutationQueue,
  clearStockQueue,
} from "../services/stockMutationQueue";

export function useStocksSync() {
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const isRefreshing = useRef(false);

  // Fetches fresh data and updates the state
  const refreshRecords = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!userId || isRefreshing.current) return;
      isRefreshing.current = true;
      if (!isBackgroundRefresh) setLoading(true);
      else setIsSyncing(true);

      try {
        const data = await getStocks();
        const syncedData = data.map((r) => ({ ...r, status: "synced" }));
        setStockRecords(syncedData);
        saveStocksToCache(syncedData);
      } catch (error) {
        console.error("API Error: getStocks failed", error);
      } finally {
        isRefreshing.current = false;
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [userId]
  );

  // Initial load and real-time subscription setup
  useEffect(() => {
    if (!userId) {
      setStockRecords([]);
      clearStocksCache();
      clearStockQueue();
      setLoading(true);
      return;
    }

    const setupAndLoad = async () => {
      const cachedData = loadStocksFromCache();
      if (cachedData) {
        setStockRecords(cachedData);
        setLoading(false);
      }

      await processStockMutationQueue({
        addStockRecord,
        updateStockRecord,
        deleteStockRecord,
      });
      await refreshRecords(!!cachedData); // Do a background refresh if cache was loaded
    };

    setupAndLoad();

    const channel = supabase
      .channel("public:stock_flow") // Listen to the 'stocks' table
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_flow" },
        (payload) => {
          console.log("Stock change received!", payload);
          refreshRecords(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshRecords]);

  // CRUD Functions with Optimistic UI and Offline Queueing

  const addRecord = async (newRecord) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticRecord = { ...newRecord, id: tempId, status: "pending" };
    setStockRecords((prev) => [optimisticRecord, ...prev]);

    try {
      const savedRecord = await addStockRecord(newRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === tempId ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API Error: addStockRecord failed", error);
      addToStockQueue({ type: "CREATE", payload: newRecord });
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "failed" } : r))
      );
    }
  };

  const updateRecord = async (updatedRecord) => {
    const originalRecords = [...stockRecords];
    setEditingRecord(null);
    setStockRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id ? { ...updatedRecord, status: "pending" } : r
      )
    );

    try {
      const savedRecord = await updateStockRecord(updatedRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === savedRecord.id ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API Error: updateStockRecord failed", error);
      addToStockQueue({ type: "UPDATE", payload: updatedRecord });
      setStockRecords(originalRecords); // Revert on failure
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const originalRecords = [...stockRecords];
    setStockRecords((prev) => prev.filter((r) => r.id !== id));

    try {
      await deleteStockRecord(id);
    } catch (error) {
      console.error("API Error: deleteStockRecord failed", error);
      addToStockQueue({ type: "DELETE", payload: { id } });
      setStockRecords(originalRecords); // Revert on failure
    }
  };

  const handleSetEditing = (record) => setEditingRecord(record);
  const cancelEditing = () => setEditingRecord(null);

  return {
    stockRecords,
    editingRecord,
    loading,
    isSyncing,
    addRecord,
    updateRecord,
    deleteRecord,
    handleSetEditing,
    cancelEditing,
  };
}
