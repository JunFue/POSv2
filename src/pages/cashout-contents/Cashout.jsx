import React, { useState, useCallback } from "react";
import { CashoutCalendar } from "./CashoutCalendar";
import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useAuth } from "../../features/pos-features/authentication/hooks/Useauth";

export function Cashout() {
  const [selection] = useState({ date: new Date() });
  const [cashouts, setCashouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const handleFilter = useCallback(
    async (currentSelection) => {
      if (!session) return;
      setLoading(true);

      const params = new URLSearchParams();
      if (currentSelection.date) {
        params.append(
          "date",
          currentSelection.date.toISOString().split("T")[0]
        );
      } else if (
        currentSelection.range &&
        currentSelection.range.from &&
        currentSelection.range.to
      ) {
        params.append(
          "startDate",
          currentSelection.range.from.toISOString().split("T")[0]
        );
        params.append(
          "endDate",
          currentSelection.range.to.toISOString().split("T")[0]
        );
      } else {
        setLoading(false);
        return;
      }

      try {
        // Use the correct singular endpoint
        const response = await fetch(
          `http://localhost:3000/api/cashout?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setCashouts(data.map((item) => ({ ...item, status: "synced" })));
      } catch (error) {
        console.error("Error fetching cashouts:", error);
        setCashouts([]);
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const handleAddCashout = (newCashout) => {
    setCashouts((prevCashouts) => [
      { ...newCashout, id: `temp-${Date.now()}`, status: "pending" },
      ...prevCashouts,
    ]);
  };

  const handleDeleteCashout = async (idToDelete) => {
    // Optimistically remove from UI
    setCashouts((prev) => prev.filter((c) => c.id !== idToDelete));

    // Send delete request to backend
    try {
      if (!session) throw new Error("Not authenticated");
      await fetch(`http://localhost:3000/api/cashout/${idToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete cashout:", error);
      // Optional: Add logic to re-add the item to the list if the delete fails
    }
  };

  const updateCashoutStatus = (tempId, newRecord) => {
    setCashouts((prev) =>
      prev.map((c) =>
        c.id === tempId ? { ...newRecord, status: "synced" } : c
      )
    );
  };

  const setCashoutFailed = (tempId) => {
    setCashouts((prev) =>
      prev.map((c) => (c.id === tempId ? { ...c, status: "failed" } : c))
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-1">
        <CashoutCalendar onFilter={handleFilter} />
      </div>
      <div className="md:col-span-2 flex flex-col gap-4">
        <CashoutForm
          // --- Pass the current date selection to the form ---
          selection={selection}
          onAddCashout={handleAddCashout}
          updateCashoutStatus={updateCashoutStatus}
          setCashoutFailed={setCashoutFailed}
        />
        <CashoutTable
          data={cashouts}
          loading={loading}
          onDelete={handleDeleteCashout}
        />
      </div>
    </div>
  );
}
