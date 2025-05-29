import { createContext, useState } from "react";

const PaymentContext = createContext();

function PaymentProvider({ children }) {
  const [paymentData, setPaymentData] = useState([]);

  return (
    <PaymentContext.Provider value={{ paymentData, setPaymentData }}>
      {children}
    </PaymentContext.Provider>
  );
}

export { PaymentContext, PaymentProvider };
