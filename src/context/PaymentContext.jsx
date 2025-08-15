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

// Helper to get today's date in YYYY-MM-DD format
const getTodaysDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [todaysPayments, setTodaysPayments] = useState([]);

  const totalCashouts = useCashoutTotal();
  const todaysNetSales = useNetSales(todaysPayments, totalCashouts);
  // 1. Use the new hook to get today's gross income.
  const todaysGrossIncome = useDailyGrossIncome(todaysPayments);

  // Function to fetch initial data from the database
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
      setTodaysPayments(data || []);
    }
  }, []);

  // Effect to fetch initial data on component mount
  useEffect(() => {
    fetchInitialPayments();
  }, [fetchInitialPayments]);

  const addTodaysPayment = useCallback((paymentRecord) => {
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      return newPayments;
    });
  }, []);

  // Supabase real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public:payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          const eventDate = new Date(
            payload.new?.transaction_date || payload.old?.transaction_date
          )
            .toISOString()
            .split("T")[0];

          if (eventDate === getTodaysDateString()) {
            fetchInitialPayments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialPayments]);

  // 2. Add todaysGrossIncome to the context value
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
