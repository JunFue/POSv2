import React, { useState, useCallback } from "react";
import { CashoutCalendar } from "./CashoutCalendar";
import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useAuth } from "../../features/pos-features/authentication/hooks/Useauth";

export function Cashout() {
  const [cashouts, setCashouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  // This function is now only called when the "Filter" button is clicked in the calendar
  const handleFilter = useCallback(
    async (selection) => {
      if (!session) return;
      setLoading(true);

      const params = new URLSearchParams();
      if (selection.date) {
        // Single date mode
        params.append("date", selection.date.toISOString().split("T")[0]);
      } else if (
        selection.range &&
        selection.range.from &&
        selection.range.to
      ) {
        // Range mode
        params.append(
          "startDate",
          selection.range.from.toISOString().split("T")[0]
        );
        params.append(
          "endDate",
          selection.range.to.toISOString().split("T")[0]
        );
      } else {
        setLoading(false);
        return; // Do nothing if selection is incomplete
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/cashouts?${params.toString()}`,
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

  const handleDeleteCashout = (id) => {
    setCashouts((prev) => prev.filter((c) => c.id !== id));
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
        {/* Pass the new handleFilter function to the calendar */}
        <CashoutCalendar onFilter={handleFilter} />
      </div>
      <div className="md:col-span-2 flex flex-col gap-4">
        <CashoutForm
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
