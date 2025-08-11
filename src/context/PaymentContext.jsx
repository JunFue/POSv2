import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { supabase } from "../utils/supabaseClient";

// Helper to get today's date in YYYY-MM-DD format
const getTodaysDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to calculate net sales
const calculateNetSales = (payments) => {
  console.log("LOG: Calculating net sales for payments:", payments);
  if (!Array.isArray(payments) || payments.length === 0) {
    console.log("LOG: Payments array is empty or invalid, returning 0.");
    return 0;
  }
  const grossSales = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount_to_pay || p.amountToPay || 0),
    0
  );
  const totalDiscount = payments.reduce(
    (sum, p) => sum + parseFloat(p.discount || 0),
    0
  );
  const netSales = grossSales - totalDiscount;
  console.log(
    `LOG: Gross: ${grossSales}, Discount: ${totalDiscount}, Net Sales: ${netSales}`
  );
  return netSales;
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [todaysPayments, setTodaysPayments] = useState([]);
  const [todaysNetSales, setTodaysNetSales] = useState(0);

  // Function to fetch initial data from the database
  const fetchInitialPayments = useCallback(async () => {
    console.log("LOG: (DB Fetch) Fetching initial payments for today.");
    const today = getTodaysDateString();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .gte("transaction_date", `${today}T00:00:00.000Z`)
      .lte("transaction_date", `${today}T23:59:59.999Z`);

    if (error) {
      console.error("LOG: (DB Fetch) Error fetching initial payments:", error);
    } else {
      console.log("LOG: (DB Fetch) Successfully fetched payments:", data);
      setTodaysPayments(data || []);
    }
  }, []);

  // Effect to fetch initial data on component mount
  useEffect(() => {
    fetchInitialPayments();
  }, [fetchInitialPayments]);

  const addTodaysPayment = useCallback((paymentRecord) => {
    console.log(
      "LOG: (Action) Adding new payment optimistically:",
      paymentRecord
    );
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      console.log("LOG: (Action) Updated todaysPayments list:", newPayments);
      return newPayments;
    });
  }, []);

  // Effect to recalculate totals when todaysPayments changes
  useEffect(() => {
    console.log(
      "LOG: (Effect) 'todaysPayments' changed, recalculating totals."
    );
    const newNetSales = calculateNetSales(todaysPayments);
    setTodaysNetSales(newNetSales);
  }, [todaysPayments]);

  // Supabase real-time subscription
  useEffect(() => {
    console.log("LOG: (Effect) Setting up Supabase subscription.");
    const channel = supabase
      .channel("public:payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          console.log("LOG: (Supabase) Change received:", payload);
          const eventDate = new Date(
            payload.new?.transaction_date || payload.old?.transaction_date
          )
            .toISOString()
            .split("T")[0];

          if (eventDate === getTodaysDateString()) {
            console.log("LOG: (Supabase) Change is for today, updating state.");
            // Instead of merging, we re-fetch to ensure consistency
            fetchInitialPayments();
          } else {
            console.log("LOG: (Supabase) Change is not for today, ignoring.");
          }
        }
      )
      .subscribe();

    return () => {
      console.log("LOG: (Effect) Cleaning up Supabase subscription.");
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
