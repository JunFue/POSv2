import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";

import { useCashoutTotal } from "../features/DASHBOARD/components/main-cards/flsh-info-cards/hooks/useCashoutTotal";
import { useNetSales } from "../features/DASHBOARD/components/main-cards/flsh-info-cards/hooks/useNetSales";
// --- 1. Import the new useGrossSales hook ---
import { useGrossSales } from "../features/DASHBOARD/components/main-cards/flsh-info-cards/hooks/useGrossSales";
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
  // --- 2. Use the new hook to calculate gross sales ---
  const todaysGrossSales = useGrossSales(todaysPayments);

  const fetchInitialPayments = useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    const today = getTodaysDateString();
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
    fetchInitialPayments();
  });

  const addTodaysPayment = useCallback((paymentRecord) => {
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      localStorage.setItem(CACHE_KEY, JSON.stringify(newPayments));
      return newPayments;
    });
  }, []);

  // --- 3. Provide the new todaysGrossSales value through the context ---
  const value = {
    todaysPayments,
    setTodaysPayments,
    todaysNetSales,
    todaysGrossSales, // Changed from todaysGrossIncome
    addTodaysPayment,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
export { PaymentContext };
