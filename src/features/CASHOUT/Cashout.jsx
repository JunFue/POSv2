import React, { useState, useCallback, useEffect } from "react";

import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useAuth } from "../AUTHENTICATION/hooks/useAuth";
import { CashoutFilters } from "./CashoutFIlters";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to format date object to 'YYYY-MM-DD' string for API calls
const toLocalDateString = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function Cashout() {
  // Standardize selection state to always have 'from' and 'to' properties
  const [selection, setSelection] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [cashouts, setCashouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const handleFilter = useCallback(
    async (currentSelection) => {
      if (!session || !currentSelection.from) return;

      setSelection(currentSelection);
      setLoading(true);

      const params = new URLSearchParams();
      params.append("startDate", toLocalDateString(currentSelection.from));
      params.append("endDate", toLocalDateString(currentSelection.to));

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/cashout?${params.toString()}`,
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

  // Fetch data when the component first mounts or when the session becomes available
  useEffect(() => {
    if (session) {
      handleFilter(selection);
    }
  }, [session]);

  const handleAddOptimistic = (newCashoutWithTempId) => {
    setCashouts((prevCashouts) => [newCashoutWithTempId, ...prevCashouts]);
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

  const handleDeleteCashout = async (idToDelete) => {
    const originalCashouts = [...cashouts];
    setCashouts((prev) => prev.filter((c) => c.id !== idToDelete));

    try {
      if (!session) throw new Error("Not authenticated");
      if (String(idToDelete).startsWith("temp-")) {
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/cashout/${idToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete on server");
      }
    } catch (error) {
      console.error("Failed to delete cashout:", error);
      setCashouts(originalCashouts);
      alert("Failed to delete the record. Please try again.");
    }
  };

  // The form needs a single date to record a cashout. We use the 'from' date of the selection.
  const formSelection = { date: selection.from };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-1">
        <CashoutFilters selection={selection} onFilter={handleFilter} />
        <div className="mt-4">
          <CashoutForm
            selection={formSelection}
            onAddOptimistic={handleAddOptimistic}
            onSubmissionSuccess={updateCashoutStatus}
            onSubmissionFailure={setCashoutFailed}
          />
        </div>
      </div>
      <div className="md:col-span-2">
        <CashoutTable
          data={cashouts}
          loading={loading}
          onDelete={handleDeleteCashout}
        />
      </div>
    </div>
  );
}
