import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { format } from "date-fns";

// Mock dependencies for the example to run standalone.
const mockSupabase = {
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
  removeChannel: () => {},
};

// This mock demonstrates the problem: it returns a new object every time.
const mockUseAuth = () => ({
  session: { access_token: "fake-token", user: { id: "user-123" } },
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api";

const CashoutContext = createContext();

const toLocalDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

export function CashoutProvider({
  children,
  supabase = mockSupabase,
  useAuthHook = mockUseAuth,
}) {
  const { session } = useAuthHook();
  // FIX: Extract primitive values from the session object.
  // These values are stable across re-renders unless they actually change.
  const accessToken = session?.access_token;
  const userId = session?.user?.id;

  // FIX: Use the stable `userId` to create the storage key.
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

  const [cashouts, setCashouts] = useState(getInitialCashouts);
  const [loading, setLoading] = useState(cashouts.length === 0);
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
      // FIX: Depend on the stable `accessToken` instead of the `session` object.
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      setSelection(currentSelection);

      const params = new URLSearchParams({
        startDate: toLocalDateString(currentSelection.from),
        endDate: toLocalDateString(currentSelection.to),
      });

      try {
        const response = await fetch(
          `${BACKEND_URL}/cashout?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch cashouts");
        const data = await response.json();
        setCashouts(data.map((item) => ({ ...item, status: "synced" })));
      } catch (err) {
        console.error("Error fetching cashouts:", err);
        setError("Could not load data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [accessToken] // FIX: Dependency is now the stable primitive value.
  );

  useEffect(() => {
    // FIX: Check for `accessToken` to decide whether to fetch.
    if (accessToken) {
      fetchCashouts({ from: new Date(), to: new Date() });
    }
  }, [accessToken, fetchCashouts]); // FIX: Correctly list dependencies.

  useEffect(() => {
    // FIX: Check for `accessToken` to set up the subscription.
    if (!accessToken || !supabase) return;

    const handleDbChange = () => {
      console.log("LOG: Cashout change detected, re-fetching...");
      fetchCashouts(selectionRef.current);
    };

    const channel = supabase
      .channel("public:cashout")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cashout" },
        handleDbChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accessToken, supabase, fetchCashouts]); // FIX: Correctly list dependencies.

  const addCashout = useCallback(
    async (data) => {
      const date = selectionRef.current.from;
      const formattedDate = toLocalDateString(date);
      const tempId = `temp-${Date.now()}`;
      const optimisticRecord = {
        ...data,
        id: tempId,
        cashout_date: formattedDate,
        status: "pending",
      };

      setCashouts((prev) => [optimisticRecord, ...prev]);
      setError(null);

      try {
        if (!accessToken) throw new Error("Not authenticated");
        const response = await fetch(`${BACKEND_URL}/cashout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ ...data, cashout_date: formattedDate }),
        });
        if (!response.ok) throw new Error("Server error");
        const savedRecord = await response.json();
        setCashouts((prev) =>
          prev.map((c) =>
            c.id === tempId ? { ...savedRecord, status: "synced" } : c
          )
        );
      } catch (err) {
        console.error("Failed to save cashout:", err);
        setError("Failed to save the record. It will be marked as failed.");
        setCashouts((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, status: "failed" } : c))
        );
      }
    },
    [accessToken] // FIX: Dependency is now the stable primitive value.
  );

  const deleteCashout = useCallback(
    async (idToDelete) => {
      const originalCashouts = cashoutsRef.current;
      setCashouts((prev) => prev.filter((c) => c.id !== idToDelete));
      setError(null);

      try {
        if (String(idToDelete).startsWith("temp-")) return;
        if (!accessToken) throw new Error("Not authenticated");
        const response = await fetch(`${BACKEND_URL}/cashout/${idToDelete}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to delete on server");
      } catch (err) {
        console.error("Failed to delete cashout, reverting:", err);
        setError("Failed to delete the record. Reverting changes.");
        setCashouts(originalCashouts);
      }
    },
    [accessToken] // FIX: Dependency is now the stable primitive value.
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
