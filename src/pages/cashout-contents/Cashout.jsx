import React, { useState, useCallback, useEffect } from "react";
import { CashoutCalendar } from "./CashoutCalendar";
import { CashoutForm } from "./cashout-form/CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useAuth } from "../../features/pos-features/authentication/hooks/Useauth";

export function Cashout() {
  const [selection, setSelection] = useState({ date: new Date() });
  const [cashouts, setCashouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const handleFilter = useCallback(
    async (currentSelection) => {
      if (!session) return;

      setSelection(currentSelection);
      setLoading(true);

      const params = new URLSearchParams();

      // --- FIX: Manually format the date to avoid timezone conversion ---
      if (currentSelection.date) {
        const date = currentSelection.date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, "0");
        params.append("date", `${year}-${month}-${day}`);
      } else if (
        currentSelection.range &&
        currentSelection.range.from &&
        currentSelection.range.to
      ) {
        const from = currentSelection.range.from;
        const to = currentSelection.range.to;

        const fromYear = from.getFullYear();
        const fromMonth = String(from.getMonth() + 1).padStart(2, "0");
        const fromDay = String(from.getDate()).padStart(2, "0");

        const toYear = to.getFullYear();
        const toMonth = String(to.getMonth() + 1).padStart(2, "0");
        const toDay = String(to.getDate()).padStart(2, "0");

        params.append("startDate", `${fromYear}-${fromMonth}-${fromDay}`);
        params.append("endDate", `${toYear}-${toMonth}-${toDay}`);
      } else {
        setLoading(false);
        return;
      }

      try {
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

  // --- NEW: Fetch data when the component mounts ---
  useEffect(() => {
    if (session) {
      handleFilter(selection);
    }
  }, [session, handleFilter]); // Dependencies ensure this runs when session is ready

  const handleAddCashout = (newCashoutWithTempId) => {
    setCashouts((prevCashouts) => [newCashoutWithTempId, ...prevCashouts]);
  };

  const handleDeleteCashout = async (idToDelete) => {
    const originalCashouts = [...cashouts];
    setCashouts((prev) => prev.filter((c) => c.id !== idToDelete));

    try {
      if (!session) throw new Error("Not authenticated");
      if (String(idToDelete).startsWith("temp-")) {
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/cashout/${idToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete on server");
      }
    } catch (error) {
      console.error("Failed to delete cashout:", error);
      setCashouts(originalCashouts);
      alert("Failed to delete the record. Please try again.");
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
