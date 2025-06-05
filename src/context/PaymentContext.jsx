import { createContext, useEffect, useState } from "react";

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [paymentData, setPaymentData] = useState(() => {
    const storedPayments = localStorage.getItem("Payments");
    return storedPayments ? JSON.parse(storedPayments) : [];
  });
  useEffect(() => {
    localStorage.setItem("Payments", JSON.stringify(paymentData));
  }, [paymentData]);

  return (
    <PaymentContext.Provider value={{ paymentData, setPaymentData }}>
      {children}
    </PaymentContext.Provider>
  );
}

export { PaymentContext };
