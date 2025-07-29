import { useState, useEffect, useCallback } from "react";
import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";

// --- REFACTORED: Import from API service file ---
import {
  getStocks,
  addStockRecord,
  updateStockRecord,
  deleteStockRecord,
} from "../../../api/stocksService";

export function Stocks() {
  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  // --- REFACTORED: Use getStocks service ---
  const fetchStocks = useCallback(async () => {
    try {
      const data = await getStocks();
      const syncedData = data.map((r) => ({ ...r, status: "synced" }));
      setStockRecords(syncedData);
    } catch (error) {
      console.error("API CALL FAILED: getStocks", error);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // --- REFACTORED: Use addStockRecord service ---
  const addRecord = async (newRecord) => {
    const tempId = crypto.randomUUID();
    const optimisticRecord = { ...newRecord, id: tempId, status: "pending" };

    setStockRecords((prevRecords) => [optimisticRecord, ...prevRecords]);

    try {
      const savedRecord = await addStockRecord(newRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === tempId ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: addStockRecord", error);
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "failed" } : r))
      );
    }
  };

  // --- REFACTORED: Use updateStockRecord service ---
  const updateRecord = async (updatedRecord) => {
    const originalRecords = [...stockRecords];
    setStockRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id ? { ...updatedRecord, status: "pending" } : r
      )
    );
    setEditingRecord(null);

    try {
      const savedRecord = await updateStockRecord(updatedRecord);
      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === savedRecord.id ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: updateStockRecord", error);
      setStockRecords(originalRecords); // Revert on failure
    }
  };

  // --- REFACTORED: Use deleteStockRecord service ---
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const originalRecords = [...stockRecords];
    setStockRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));

    try {
      await deleteStockRecord(id);
      // If successful, the optimistic deletion is final.
    } catch (error) {
      console.error("API CALL FAILED: deleteStockRecord", error);
      setStockRecords(originalRecords); // Revert on failure
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
