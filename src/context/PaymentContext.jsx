import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { useCashoutTotal } from "../features/DASHBOARD/main-cards/flsh-info-cards/hooks/useCashoutTotal";
// TODO: Adjust the import path to correctly locate your useCashoutTotal hook.

// Helper to get today's date in YYYY-MM-DD format
const getTodaysDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to calculate net sales
// It now accepts totalCashouts to include in the calculation.
const calculateNetSales = (payments, totalCashouts = 0) => {
  if (!Array.isArray(payments)) {
    return 0 - totalCashouts;
  }
  const grossSales = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount_to_pay || p.amountToPay || 0),
    0
  );
  const totalDiscount = payments.reduce(
    (sum, p) => sum + parseFloat(p.discount || 0),
    0
  );

  // Subtract discounts and total cashouts from gross sales.
  const netSales = grossSales - totalDiscount - totalCashouts;

  return netSales;
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [todaysPayments, setTodaysPayments] = useState([]);
  const [todaysNetSales, setTodaysNetSales] = useState(0);

  // 1. Get the total cashouts using the custom hook.
  const totalCashouts = useCashoutTotal();

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

  // 2. Effect to recalculate totals when todaysPayments OR totalCashouts changes
  useEffect(() => {
    // Pass the totalCashouts to the calculation function.
    const newNetSales = calculateNetSales(todaysPayments, totalCashouts);
    setTodaysNetSales(newNetSales);
  }, [todaysPayments, totalCashouts]); // 3. Add totalCashouts to the dependency array.

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

  const value = {
    todaysPayments,
    setTodaysPayments,
    todaysNetSales,
    addTodaysPayment,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
export { PaymentContext };
