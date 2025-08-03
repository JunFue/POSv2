import { useState, useEffect, useCallback } from "react";
import {
  getStocks,
  addStockRecord,
  updateStockRecord,
  deleteStockRecord,
} from "../../../../api/stocksService";

import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

// The key for storing stock data in localStorage.
const CACHE_KEY = "stocksData";

// --- REVISION ---
// The endpoint now dynamically uses the backend URL from your .env file.
// Vite exposes environment variables prefixed with "VITE_" on the import.meta.env object.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const STOCK_STATUS_ENDPOINT = `${BACKEND_URL}/api/status/stocks`;

/**
 * Custom hook for managing stock records with an efficient, backend-driven cache.
 */
export function useStocks() {
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isVisible = usePageVisibility();

  /**
   * Fetches fresh stock data from the server and updates both the state and the local cache.
   */
  const fetchStocks = useCallback(async () => {
    if (!user) return;
    console.log("Fetching fresh stock data from the server...");
    setLoading(true); // Show loading indicator during fetch
    try {
      const data = await getStocks();
      const syncedData = data.map((r) => ({
        ...r,
        status: "synced",
        isOriginal: true,
      }));
      setStockRecords(syncedData);

      // Update the cache with the new data and the current timestamp.
      const cacheData = {
        value: syncedData,
        timestamp: Date.now(), // This marks when the client cache was updated.
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("API CALL FAILED: getStocks", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * This effect handles the core cache validation logic.
   */
  useEffect(() => {
    const validateCacheAndFetch = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const cachedItemJSON = localStorage.getItem(CACHE_KEY);
      let localCacheTimestamp = 0;

      if (cachedItemJSON) {
        const { value, timestamp } = JSON.parse(cachedItemJSON);
        setStockRecords(value);
        localCacheTimestamp = timestamp;
      }
      setLoading(false);

      try {
        console.log("Checking cache status with the local backend...");
        const response = await fetch(STOCK_STATUS_ENDPOINT);
        if (!response.ok) {
          // This will now catch the 401 error if it happens
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const { lastUpdatedAt } = await response.json();

        if (lastUpdatedAt > localCacheTimestamp) {
          console.log("Cache is stale. Refetching data.");
          await fetchStocks();
        } else {
          console.log("Cache is fresh. No refetch needed.");
        }
      } catch (error) {
        console.error("Could not validate cache with backend:", error);
        if (!cachedItemJSON) {
          await fetchStocks();
        }
      }
    };

    if (isVisible && user) {
      validateCacheAndFetch();
    }
  }, [isVisible, user, fetchStocks]);

  // --- Optimistic UI Update Functions ---
  const addRecord = async (newRecord) => {
    const tempId = crypto.randomUUID();
    const optimisticRecord = {
      ...newRecord,
      id: tempId,
      status: "pending",
      isOriginal: true,
    };
    setStockRecords((prev) => [optimisticRecord, ...prev]);
    try {
      const savedRecord = await addStockRecord(newRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === tempId
            ? { ...savedRecord, status: "synced", isOriginal: true }
            : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: addStockRecord", error);
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "failed" } : r))
      );
    }
  };

  const updateRecord = async (updatedRecord) => {
    const originalRecords = [...stockRecords];
    setStockRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id
          ? { ...updatedRecord, status: "pending", isOriginal: false }
          : r
      )
    );
    setEditingRecord(null);
    try {
      const savedRecord = await updateStockRecord(updatedRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === savedRecord.id
            ? { ...savedRecord, status: "synced", isOriginal: false }
            : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: updateStockRecord", error);
      setStockRecords(originalRecords);
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const originalRecords = [...stockRecords];
    setStockRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteStockRecord(id);
    } catch (error) {
      console.error("API CALL FAILED: deleteStockRecord", error);
      setStockRecords(originalRecords);
    }
  };

  const handleSetEditing = (record) => setEditingRecord(record);
  const cancelEditing = () => setEditingRecord(null);

  return {
    stockRecords,
    editingRecord,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    handleSetEditing,
    cancelEditing,
  };
}
