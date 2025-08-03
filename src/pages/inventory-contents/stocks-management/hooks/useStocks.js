import { useState, useEffect, useCallback } from "react";
import {
  getStocks,
  addStockRecord,
  updateStockRecord,
  deleteStockRecord,
} from "../../../../api/stocksService";

import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { usePageVisibility } from "../../../../hooks/usePageVisibility";

const CACHE_KEY = "stocksData";
const CACHE_TTL_MS = 10 * 60 * 1000; // Cache stocks data for 10 minutes

/**
 * Custom hook for managing stock records state and logic.
 */
export function useStocks() {
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isVisible = usePageVisibility();

  const fetchStocks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStocks();
      const syncedData = data.map((r) => ({
        ...r,
        status: "synced",
        isOriginal: true,
      }));
      setStockRecords(syncedData);

      const cacheData = {
        value: syncedData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("API CALL FAILED: getStocks", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setStockRecords(value);
        setLoading(false);
      }
    }
    if (user) {
      fetchStocks();
    }
  }, [user, fetchStocks]);

  useEffect(() => {
    if (isVisible && user) {
      fetchStocks();
    }
  }, [isVisible, user, fetchStocks]);

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
