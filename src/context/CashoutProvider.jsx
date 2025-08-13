import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { format } from "date-fns";
import { useAuth } from "../features/AUTHENTICATION/hooks/useAuth";
import { supabase } from "../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const CashoutContext = createContext();

const toLocalDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

/**
 * A helper function to transform cashout data from the backend (snake_case)
 * to the frontend's preferred format (camelCase).
 */
const transformCashoutData = (data) => {
  if (!data) return null;
  const { receipt_no, ...rest } = data;
  return {
    ...rest,
    receiptNo: receipt_no, // Translate snake_case to camelCase
  };
};

export function CashoutProvider({ children }) {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const userId = session?.user?.id;

  const CASHOUT_STORAGE_KEY = `cashoutData_${userId || "guest"}`;

  const getInitialCashouts = useCallback(() => {
    try {
      const saved = localStorage.getItem(CASHOUT_STORAGE_KEY);
      if (!saved) return [];
      const { data, date } = JSON.parse(saved);
      if (date !== toLocalDateString(new Date())) {
        localStorage.removeItem(CASHOUT_STORAGE_KEY);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to parse cashouts from localStorage", error);
      return [];
    }
  }, [CASHOUT_STORAGE_KEY]);

  const initialData = getInitialCashouts();
  const [cashouts, setCashouts] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [selection, setSelection] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [error, setError] = useState(null);

  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const cashoutsRef = useRef(cashouts);
  useEffect(() => {
    cashoutsRef.current = cashouts;
  }, [cashouts]);

  useEffect(() => {
    const stateToSave = {
      date: toLocalDateString(new Date()),
      data: cashouts,
    };
    localStorage.setItem(CASHOUT_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [cashouts, CASHOUT_STORAGE_KEY]);

  const clearError = () => setError(null);

  const fetchCashouts = useCallback(
    async (currentSelection) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setSelection(currentSelection);

      const params = new URLSearchParams({
        startDate: toLocalDateString(currentSelection.from),
        endDate: toLocalDateString(currentSelection.to),
      });

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/cashout?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch cashouts");
        const data = await response.json();

        // FIX: Transform all incoming data to use camelCase
        const transformedData = data.map((item) => ({
          ...transformCashoutData(item),
          status: "synced",
        }));
        setCashouts(transformedData);
      } catch (err) {
        console.error("Error fetching cashouts:", err);
        setError("Could not load data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      const initialSelection = { from: new Date(), to: new Date() };
      const params = new URLSearchParams({
        startDate: toLocalDateString(initialSelection.from),
        endDate: toLocalDateString(initialSelection.to),
      });

      fetch(`${BACKEND_URL}/api/cashout?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Background fetch failed");
          return res.json();
        })
        .then((data) => {
          // FIX: Transform all incoming data to use camelCase
          const transformedData = data.map((item) => ({
            ...transformCashoutData(item),
            status: "synced",
          }));
          setCashouts(transformedData);
        })
        .catch((err) => {
          console.error("Error during background fetch:", err);
        })
        .finally(() => {
          if (loading) setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [accessToken, loading]);

  useEffect(() => {
    if (!accessToken) return;

    const handleDbChange = () => {
      fetchCashouts(selectionRef.current);
    };

    const channel = supabase
      .channel("public:cashouts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cashouts" },
        handleDbChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accessToken, fetchCashouts]);

  const addCashout = useCallback(
    async (data) => {
      const date = selectionRef.current.from;
      const formattedDate = toLocalDateString(date);
      const tempId = `temp-${Date.now()}`;

      // FIX: The optimistic record now uses the camelCase 'receiptNo' key
      // consistently with the rest of the frontend state.
      const optimisticRecord = {
        ...data, // This comes from the form with 'receiptNo'
        id: tempId,
        cashout_date: formattedDate,
        status: "pending",
      };

      setCashouts((prev) => [optimisticRecord, ...prev]);
      setError(null);

      try {
        if (!accessToken) throw new Error("Not authenticated");

        // FIX: The payload sent to the backend correctly uses 'receipt_no' (snake_case).
        const payload = {
          ...data,
          receipt_no: data.receiptNo, // Translate to snake_case for the API
          cashout_date: formattedDate,
        };
        delete payload.receiptNo; // Clean up the camelCase key before sending

        const response = await fetch(`${BACKEND_URL}/api/cashout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Server error");
        const savedRecord = await response.json();

        // FIX: Transform the response from the server before updating state.
        const transformedRecord = {
          ...transformCashoutData(savedRecord),
          status: "synced",
        };

        setCashouts((prev) =>
          prev.map((c) => (c.id === tempId ? transformedRecord : c))
        );
      } catch (err) {
        console.error("Failed to save cashout:", err);
        setError("Failed to save the record. It will be marked as failed.");
        setCashouts((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, status: "failed" } : c))
        );
      }
    },
    [accessToken]
  );

  const deleteCashout = useCallback(
    async (idToDelete) => {
      const originalCashouts = cashoutsRef.current;
      setCashouts((prev) => prev.filter((c) => c.id !== idToDelete));
      setError(null);

      try {
        if (String(idToDelete).startsWith("temp-")) return;
        if (!accessToken) throw new Error("Not authenticated");
        const response = await fetch(
          `${BACKEND_URL}/api/cashout/${idToDelete}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) throw new Error("Failed to delete on server");
      } catch (err) {
        console.error("Failed to delete cashout, reverting:", err);
        setError("Failed to delete the record. Reverting changes.");
        setCashouts(originalCashouts);
      }
    },
    [accessToken]
  );

  const value = {
    cashouts,
    loading,
    selection,
    error,
    fetchCashouts,
    addCashout,
    deleteCashout,
    clearError,
  };

  return (
    <CashoutContext.Provider value={value}>{children}</CashoutContext.Provider>
  );
}

export const useCashout = () => {
  const context = useContext(CashoutContext);
  if (!context) {
    throw new Error("useCashout must be used within a CashoutProvider");
  }
  return context;
};
