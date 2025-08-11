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

// Helper function to calculate net sales, can be used in multiple places
const calculateNetSales = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return 0;
  }
  const grossSales = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount_to_pay || 0),
    0
  );
  const totalDiscount = payments.reduce(
    (sum, p) => sum + parseFloat(p.discount || 0),
    0
  );
  return grossSales - totalDiscount;
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [todaysPayments, setTodaysPayments] = useState(() => {
    console.log("LOG: Initializing todaysPayments from localStorage.");
    const stored = localStorage.getItem("todaysPayments");
    if (stored) {
      const { date, data } = JSON.parse(stored);
      if (date === getTodaysDateString()) {
        console.log("LOG: Found valid data for today in localStorage.");
        return data;
      }
    }
    console.log(
      "LOG: No valid data for today in localStorage, starting fresh."
    );
    return [];
  });

  // New state for the calculated total, initialized from localStorage data
  const [todaysNetSales, setTodaysNetSales] = useState(() => {
    const stored = localStorage.getItem("todaysPayments");
    if (stored) {
      const { date, data } = JSON.parse(stored);
      if (date === getTodaysDateString()) {
        return calculateNetSales(data);
      }
    }
    return 0;
  });

  const [paymentData, setPaymentData] = useState([]);

  // New function to add a payment and update the total atomically
  const addTodaysPayment = useCallback((paymentRecord) => {
    setTodaysPayments((prevPayments) => {
      const newPayments = [paymentRecord, ...prevPayments];
      // Recalculate and update the net sales state at the same time
      setTodaysNetSales(calculateNetSales(newPayments));
      return newPayments;
    });
  }, []);

  // Effect to sync total and localStorage when todaysPayments changes from any source
  useEffect(() => {
    console.log(
      "LOG: todaysPayments changed, recalculating total and updating localStorage."
    );
    setTodaysNetSales(calculateNetSales(todaysPayments));
    const dataToStore = {
      date: getTodaysDateString(),
      data: todaysPayments,
    };
    localStorage.setItem("todaysPayments", JSON.stringify(dataToStore));
  }, [todaysPayments]);

  // Supabase real-time subscription
  useEffect(() => {
    console.log("LOG: Setting up Supabase subscription for 'payments' table.");
    const channel = supabase
      .channel("public:payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          console.log("LOG: Supabase change received:", payload);
          // The main useEffect will handle recalculation when setTodaysPayments updates the state
          const eventDate = new Date(
            payload.new.transaction_date || payload.old.transaction_date
          )
            .toISOString()
            .split("T")[0];

          if (eventDate === getTodaysDateString()) {
            setTodaysPayments((currentPayments) => {
              const newPayments = [...currentPayments];
              const index = newPayments.findIndex(
                (p) => p.id === (payload.new.id || payload.old.id)
              );
              if (payload.eventType === "INSERT") {
                if (index === -1) newPayments.push(payload.new);
              } else if (payload.eventType === "UPDATE") {
                if (index !== -1) newPayments[index] = payload.new;
              } else if (payload.eventType === "DELETE") {
                if (index !== -1) newPayments.splice(index, 1);
              }
              return newPayments;
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("LOG: Cleaning up Supabase subscription.");
      supabase.removeChannel(channel);
    };
  }, []);

  const value = {
    todaysPayments,
    setTodaysPayments, // Keep for fetcher
    paymentData,
    setPaymentData,
    todaysNetSales, // Expose the new total
    addTodaysPayment, // Expose the new atomic function
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
export { PaymentContext };
