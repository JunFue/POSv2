import { useState, useEffect, useCallback } from "react";
import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";
import { useAuth } from "../../../features/pos-features/authentication/hooks/useAuth";

// The base URL for your API. Make sure this matches your server's address.
const API_URL = "http://localhost:3000/api";

export function Stocks() {
  // --- FIX: Get the session object and extract the access_token from it ---
  const { session } = useAuth();
  const token = session?.access_token; // The JWT is here

  const [stockRecords, setStockRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  // --- API LOGIC ---

  // GET Stocks from the backend
  const fetchStocks = useCallback(async () => {
    if (!token) return; // Don't fetch if there's no token

    try {
      const response = await fetch(`${API_URL}/stocks`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Add a 'synced' status to the records coming from the server
      const syncedData = data.map((r) => ({ ...r, status: "synced" }));
      setStockRecords(syncedData);
    } catch (error) {
      console.error("API CALL FAILED: GET /stocks", error);
      // Optionally, set an error state to show a message in the UI
    }
  }, [token]);

  // Initial data load
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // POST a new stock record to the backend
  const addRecord = async (newRecord) => {
    if (!token) {
      console.error("Add record failed: User is not authenticated.");
      return;
    }

    const tempId = crypto.randomUUID();
    const optimisticRecord = { ...newRecord, id: tempId, status: "pending" };

    setStockRecords((prevRecords) => [optimisticRecord, ...prevRecords]);

    try {
      const response = await fetch(`${API_URL}/stocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedRecord = await response.json();

      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === tempId ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: POST /stocks", error);
      setStockRecords((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, status: "failed" } : r))
      );
    }
  };

  // UPDATE a stock record on the backend
  const updateRecord = async (updatedRecord) => {
    if (!token) {
      console.error("Update record failed: User is not authenticated.");
      return;
    }

    const originalRecords = [...stockRecords];

    setStockRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id ? { ...updatedRecord, status: "pending" } : r
      )
    );
    setEditingRecord(null);

    try {
      const response = await fetch(`${API_URL}/stocks/${updatedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedRecord = await response.json();

      setStockRecords((prev) =>
        prev.map((r) =>
          r.id === savedRecord.id ? { ...savedRecord, status: "synced" } : r
        )
      );
    } catch (error) {
      console.error("API CALL FAILED: UPDATE /stocks", error);
      setStockRecords(originalRecords);
    }
  };

  // DELETE a stock record from the backend
  const deleteRecord = async (id) => {
    if (!token) {
      console.error("Delete record failed: User is not authenticated.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const originalRecords = [...stockRecords];

    setStockRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));

    try {
      const response = await fetch(`${API_URL}/stocks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("DELETE successful.");
    } catch (error) {
      console.error("API CALL FAILED: DELETE /stocks", error);
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
