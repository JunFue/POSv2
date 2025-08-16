import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";

import { useCashoutTotal } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useCashoutTotal";
import { useNetSales } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useNetSales";
import { useDailyGrossIncome } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useDailyGrossIncome";
import { useSupabaseSubscription } from "../hooks/useSupabaseSubscription";
import { useAuth } from "../features/AUTHENTICATION/hooks/useAuth";

const CACHE_KEY = "todaysPaymentsData";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [todaysPayments, setTodaysPayments] = useState(getCachedPayments);
  const { session } = useAuth();

  const totalCashouts = useCashoutTotal();
  const todaysNetSales = useNetSales(todaysPayments, totalCashouts);
  const todaysGrossIncome = useDailyGrossIncome(todaysPayments);

  const fetchInitialPayments = useCallback(async () => {
    if (!session?.access_token) {
      console.log("No session found, skipping payments list fetch.");
      return;
    }

    console.log("Fetching latest payments list from backend server...");
    const today = getTodaysDateString();
    // --- FIX: Using the correct endpoint to fetch the LIST of payments ---
    const url = `${BACKEND_URL}/api/payments?startDate=${today}&endDate=${today}&limit=1000`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      const freshData = result.data || [];

      console.log("Fetched new payments list. Count:", freshData.length);
      setTodaysPayments(freshData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    } catch (error) {
      console.error("LOG: (API Fetch) Error fetching payments list:", error);
    }
  }, [session]);

  useEffect(() => {
    fetchInitialPayments();
  }, [fetchInitialPayments]);

  useSupabaseSubscription("public:payments", "payments", () => {
    console.log("Supabase change detected! Refetching payments list.");
    fetchInitialPayments();
  });

  const addTodaysPayment = useCallback((paymentRecord) => {
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      localStorage.setItem(CACHE_KEY, JSON.stringify(newPayments));
      return newPayments;
    });
  }, []);

  useEffect(() => {
    console.log("Gross income from context recalculated:", todaysGrossIncome);
  }, [todaysGrossIncome]);

  const value = {
    todaysPayments,
    setTodaysPayments,
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
