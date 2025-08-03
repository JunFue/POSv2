import { useState, useEffect, useCallback } from "react";
import {
  getStocks,
  addStockRecord,
  updateStockRecord,
  deleteStockRecord,
} from "../../../../api/stocksService";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

// Define the keys for localStorage and the backend status endpoint.
const STOCKS_CACHE_KEY = "stocksData";
const STOCKS_TIMESTAMP_KEY = "stocksDataTimestamp";
// It's good practice to use environment variables for URLs.
const ITEM_STATUS_ENDPOINT = `${
  import.meta.env.VITE_BACKEND_URL
}/api/status/stocks`;

/**
 * Custom hook for managing stocks using a polling-based caching strategy.
 * It loads cached data first for an instant UI, then checks a status
 * endpoint to see if a full data fetch is needed.
 */
export function useStocks() {
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isVisible = usePageVisibility();

  /**
   * Fetches the full list of stocks from the primary API endpoint.
   * After a successful fetch, it updates both the data cache and the
   * local timestamp to match the server's latest update time.
   */
  const fetchStocks = useCallback(async () => {
    if (!user) return;
    console.log("Fetching new stock data from server...");

    try {
      // 1. Fetch the actual stock data.
      const data = await getStocks();
      const syncedData = data.map((r) => ({
        ...r,
        status: "synced",
        isOriginal: true,
      }));
      setStockRecords(syncedData);
      localStorage.setItem(STOCKS_CACHE_KEY, JSON.stringify(syncedData));

      // 2. After fetching, get the latest timestamp from the status endpoint.
      // This syncs our local cache's timestamp with the server's last known update.
      const statusRes = await fetch(ITEM_STATUS_ENDPOINT);
      const { lastUpdatedAt } = await statusRes.json();
      localStorage.setItem(STOCKS_TIMESTAMP_KEY, lastUpdatedAt);

      console.log("Successfully fetched new data and updated cache timestamp.");
    } catch (error) {
      console.error("API CALL FAILED: getStocks", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Checks the backend status endpoint and compares its timestamp with our
   * locally stored timestamp to decide whether a full data refresh is needed.
   */
  const checkForUpdates = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(ITEM_STATUS_ENDPOINT);
      if (!response.ok) throw new Error("Status check request failed.");

      const { lastUpdatedAt: serverTimestamp } = await response.json();
      const localTimestamp = localStorage.getItem(STOCKS_TIMESTAMP_KEY);

      // Fetch new data if we don't have a local timestamp or if the server's is newer.
      if (!localTimestamp || serverTimestamp > Number(localTimestamp)) {
        console.log("Cache is stale. Refreshing data.");
        await fetchStocks();
      } else {
        console.log("Cache is up to date.");
        // If the cache is current, ensure loading is false.
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to check for stock updates:", error);
      // Even if the check fails, we might have cached data, so stop loading.
      setLoading(false);
    }
  }, [user, fetchStocks]);

  // Effect for the initial data load.
  useEffect(() => {
    // 1. Load data from cache immediately on mount for a fast UI.
    const cachedData = localStorage.getItem(STOCKS_CACHE_KEY);
    if (cachedData) {
      setStockRecords(JSON.parse(cachedData));
      setLoading(false); // We have data to show, so we're not "loading".
    }

    // 2. Then, check for any updates in the background.
    if (user) {
      checkForUpdates();
    }
  }, [user, checkForUpdates]);

  // Effect to re-check for updates when the tab becomes visible again.
  useEffect(() => {
    if (isVisible && user) {
      console.log("Page is visible, checking for updates.");
      checkForUpdates();
    }
  }, [isVisible, user, checkForUpdates]);

  // --- CRUD Operations (Optimistic Updates) ---
  // These functions can remain as they are. When they succeed, your backend
  // webhook will update the server timestamp. The polling mechanism will then
  // naturally pick up the change on the next check.

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
      // We can do a local update for instant feedback. The next poll will verify it.
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
    // Using a custom modal for confirmation is better than window.confirm.
    // For this example, we'll assume confirmation was given.
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
