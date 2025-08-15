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

const getTodaysDateString = () => new Date().toISOString().split("T")[0];

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [todaysPayments, setTodaysPayments] = useState([]);

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
      setTodaysPayments(data || []);
    }
  }, []);

  useEffect(() => {
    fetchInitialPayments();
  }, [fetchInitialPayments]);

  // 2. Use the hook to listen for changes on the 'payments' table.
  // The callback will only refetch if the change happened today.
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
    setTodaysPayments((prevPayments) => [paymentRecord, ...prevPayments]);
  }, []);

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
