import { useState, useEffect, useCallback } from "react";
import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";
import { useAuth } from "../../../features/pos-features/authentication/hooks/useAuth";

// Helper functions for localStorage
const getLocalStocks = () => {
  const saved = localStorage.getItem("stockRecords");
  return saved ? JSON.parse(saved) : null;
};

const saveLocalStocks = (records) => {
  localStorage.setItem("stockRecords", JSON.stringify(records));
};

export function Stocks() {
  const { token } = useAuth(); // Get auth token
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null); // The record currently being edited

  // --- API LOGIC (with console.log placeholders) ---

  // GET Stocks
  const fetchStocks = useCallback(async () => {
    console.log("API CALL: GET /stocks", { token });
    // Simulate API call
    await new Promise((res) => setTimeout(res, 500));
    const localData = getLocalStocks() || [];
    const syncedData = localData.map((r) => ({
      ...r,
      status: "synced",
      isOriginal: true,
    }));
    setStockRecords(syncedData);
    saveLocalStocks(syncedData);
    console.log("GET successful, local storage updated.");
  }, [token]);

  // Initial data load
  useEffect(() => {
    const localData = getLocalStocks();
    if (localData) {
      console.log("Loading data from localStorage.");
      setStockRecords(localData);
    } else {
      console.log("No local data, fetching from server.");
      fetchStocks();
    }
  }, [fetchStocks]);

  // POST a new stock record
  const addRecord = async (newRecord) => {
    const tempId = crypto.randomUUID();
    const optimisticRecord = {
      ...newRecord,
      id: tempId,
      status: "pending",
      isOriginal: true,
    };

    // Optimistic UI update
    setStockRecords((prev) => [optimisticRecord, ...prev]);
    saveLocalStocks([optimisticRecord, ...stockRecords]);

    console.log("API CALL: POST /stocks", { data: newRecord, token });
    // Simulate API call
    try {
      await new Promise((res) => setTimeout(res, 1500)); // Simulate network delay
      // On success, update status to 'synced'
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "synced" } : r))
      );
      console.log("POST successful. Row synced.");
      // Optional: Refetch all data to ensure consistency
      // await fetchStocks();
    } catch (error) {
      console.error("API CALL FAILED: POST /stocks", error);
      // On failure, update status to 'failed'
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "failed" } : r))
      );
    }
  };

  // UPDATE a stock record
  const updateRecord = async (updatedRecord) => {
    const originalRecords = [...stockRecords]; // Keep a copy in case of failure
    // Optimistic UI update
    setStockRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id
          ? { ...updatedRecord, status: "pending", isOriginal: false }
          : r
      )
    );
    setEditingRecord(null); // Exit editing mode

    console.log("API CALL: UPDATE /stocks", { data: updatedRecord, token });
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === updatedRecord.id ? { ...r, status: "synced" } : r
        )
      );
      console.log("UPDATE successful. Row synced.");
    } catch (error) {
      console.error("API CALL FAILED: UPDATE /stocks", error);
      // Revert to original state on failure
      setStockRecords(originalRecords);
    }
  };

  // DELETE a stock record
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const originalRecords = [...stockRecords];
    // Optimistic UI update
    setStockRecords((prev) => prev.filter((r) => r.id !== id));

    console.log("API CALL: DELETE /stocks", { id, token });
    try {
      await new Promise((res) => setTimeout(res, 1000));
      console.log("DELETE successful.");
      // Remove from local storage as well
      saveLocalStocks(stockRecords.filter((r) => r.id !== id));
    } catch (error) {
      console.error("API CALL FAILED: DELETE /stocks", error);
      // Revert on failure
      setStockRecords(originalRecords);
    }
  };

  const handleSetEditing = (record) => {
    setEditingRecord(record);
  };

  const cancelEditing = () => {
    setEditingRecord(null);
  };

  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-background rounded-lg h-fit">
      <StocksForm
        onAddRecord={addRecord}
        onUpdateRecord={updateRecord}
        editingRecord={editingRecord}
        onCancelEdit={cancelEditing}
      />
      <StocksTable
        stockRecords={stockRecords}
        onEdit={handleSetEditing}
        onDelete={deleteRecord}
        editingRecordId={editingRecord?.id}
      />
    </div>
  );
}
