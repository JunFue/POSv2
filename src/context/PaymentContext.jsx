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

// Helper function to read and parse initial state from localStorage
const getInitialPayments = () => {
  console.log("LOG: (Init) Reading initial payments from localStorage.");
  const stored = localStorage.getItem("todaysPayments");
  if (stored) {
    try {
      const { date, data } = JSON.parse(stored);
      if (date === getTodaysDateString() && Array.isArray(data)) {
        console.log("LOG: (Init) Found valid data for today:", data);
        return data;
      }
    } catch (e) {
      console.error("LOG: (Init) Failed to parse localStorage data.", e);
      return [];
    }
  }
  console.log("LOG: (Init) No valid data in localStorage, starting fresh.");
  return [];
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  // Get the initial data once to avoid multiple localStorage reads
  const initialPayments = getInitialPayments();

  // Initialize both states from this single source of truth
  const [todaysPayments, setTodaysPayments] = useState(initialPayments);
  const [todaysNetSales, setTodaysNetSales] = useState(() =>
    calculateNetSales(initialPayments)
  );

  const addTodaysPayment = useCallback((paymentRecord) => {
    console.log("LOG: (Action) Adding new payment:", paymentRecord);
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      console.log("LOG: (Action) Updated todaysPayments list:", newPayments);
      // The useEffect will handle the net sales calculation
      return newPayments;
    });
  }, []);

  // Effect to sync total and localStorage when todaysPayments changes
  useEffect(() => {
    console.log(
      "LOG: (Effect) 'todaysPayments' changed, recalculating totals."
    );
    const newNetSales = calculateNetSales(todaysPayments);
    setTodaysNetSales(newNetSales);

    console.log("LOG: (Effect) Updating localStorage with new data.");
    const dataToStore = {
      date: getTodaysDateString(),
      data: todaysPayments,
    };
    localStorage.setItem("todaysPayments", JSON.stringify(dataToStore));
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
            payload.new.transaction_date || payload.old.transaction_date
          )
            .toISOString()
            .split("T")[0];

          if (eventDate === getTodaysDateString()) {
            console.log("LOG: (Supabase) Change is for today, updating state.");
            setTodaysPayments((currentPayments) => {
              let newPayments = [...currentPayments];
              const index = newPayments.findIndex(
                (p) => p.id === (payload.new.id || payload.old.id)
              );

              if (payload.eventType === "INSERT") {
                if (index === -1) newPayments.unshift(payload.new);
              } else if (payload.eventType === "UPDATE") {
                if (index !== -1) newPayments[index] = payload.new;
              } else if (payload.eventType === "DELETE") {
                newPayments = newPayments.filter(
                  (p) => p.id !== payload.old.id
                );
              }
              console.log(
                "LOG: (Supabase) Payments list after update:",
                newPayments
              );
              return newPayments;
            });
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
  }, []);

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
