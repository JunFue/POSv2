import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { useCashoutTotal } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useCashoutTotal";
import { useNetSales } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useNetSales";
import { useDailyGrossIncome } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useDailyGrossIncome";
import { useSupabaseSubscription } from "../hooks/useSupabaseSubscription";

const CACHE_KEY = "todaysPaymentsData";

// Helper function to safely get and parse data from localStorage.
const getCachedPayments = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Failed to parse cached payments:", e);
      return [];
    }
  }
  return [];
};

const getTodaysDateString = () => new Date().toISOString().split("T")[0];

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  // 1. Initialize state from localStorage for an instant UI.
  const [todaysPayments, setTodaysPayments] = useState(getCachedPayments);

  const totalCashouts = useCashoutTotal();
  const todaysNetSales = useNetSales(todaysPayments, totalCashouts);
  const todaysGrossIncome = useDailyGrossIncome(todaysPayments);

  const fetchInitialPayments = useCallback(async () => {
    const today = getTodaysDateString();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .gte("transaction_date", `${today}T00:00:00.000Z`)
      .lte("transaction_date", `${today}T23:59:59.999Z`);

    if (error) {
      console.error("LOG: (DB Fetch) Error fetching initial payments:", error);
    } else {
      const freshData = data || [];
      // 2. Update both the state and the localStorage cache with fresh data.
      setTodaysPayments(freshData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    }
  }, []);

  // 3. On mount, fetch the latest data in the background.
  useEffect(() => {
    fetchInitialPayments();
  }, [fetchInitialPayments]);

  // 4. The subscription will now fetch and update the cache automatically.
  useSupabaseSubscription("public:payments", "payments", (payload) => {
    const eventDate = new Date(
      payload.new?.transaction_date || payload.old?.transaction_date
    )
      .toISOString()
      .split("T")[0];

    if (eventDate === getTodaysDateString()) {
      fetchInitialPayments();
    }
  });

  const addTodaysPayment = useCallback((paymentRecord) => {
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      // Also update cache when adding a payment locally
      localStorage.setItem(CACHE_KEY, JSON.stringify(newPayments));
      return newPayments;
    });
  }, []);

  const value = {
    todaysPayments,
    setTodaysPayments, // You might not need to export this anymore
    todaysNetSales,
    todaysGrossIncome,
    addTodaysPayment,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
export { PaymentContext };
