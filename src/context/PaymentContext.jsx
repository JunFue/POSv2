import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabaseClient";

// Helper to get today's date in YYYY-MM-DD format
const getTodaysDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  // State for today's payments, initialized from localStorage for instant UI
  const [todaysPayments, setTodaysPayments] = useState(() => {
    console.log("LOG: Initializing todaysPayments from localStorage.");
    const stored = localStorage.getItem("todaysPayments");
    if (stored) {
      const { date, data } = JSON.parse(stored);
      // Only load if the stored data is from today
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

  // State for payments from other dates, fetched from the server
  const [paymentData, setPaymentData] = useState([]);

  // Effect to persist todaysPayments to localStorage
  useEffect(() => {
    console.log("LOG: todaysPayments state changed, updating localStorage.");
    const dataToStore = {
      date: getTodaysDateString(),
      data: todaysPayments,
    };
    localStorage.setItem("todaysPayments", JSON.stringify(dataToStore));
  }, [todaysPayments]);

  // Effect for Supabase real-time subscription
  useEffect(() => {
    console.log("LOG: Setting up Supabase subscription for 'payments' table.");

    const channel = supabase
      .channel("public:payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          console.log("LOG: Supabase change received:", payload);
          const eventDate = new Date(
            payload.new.transaction_date || payload.old.transaction_date
          )
            .toISOString()
            .split("T")[0];

          // Only update if the change affects today's payments
          if (eventDate === getTodaysDateString()) {
            console.log(
              "LOG: Change affects today's data. Updating todaysPayments."
            );
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
          } else {
            console.log("LOG: Change does not affect today's data. Ignoring.");
          }
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription
    return () => {
      console.log("LOG: Cleaning up Supabase subscription.");
      supabase.removeChannel(channel);
    };
  }, []);

  const value = {
    todaysPayments,
    setTodaysPayments,
    paymentData,
    setPaymentData,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
export { PaymentContext };
