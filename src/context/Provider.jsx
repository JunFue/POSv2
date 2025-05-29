import React from "react";
import { StocksMgtProvider } from "./StocksManagement.jsx";
import { ItemSoldProvider } from "./ItemSoldContext.jsx";
import { ItemRegProvider } from "./ItemRegContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { PaymentProvider } from "./PaymentContext.jsx";

export function AppProviders({ children }) {
  return (
    <PaymentProvider>
      <StocksMgtProvider>
        <ItemSoldProvider>
          <ItemRegProvider>
            <CartProvider>{children}</CartProvider>
          </ItemRegProvider>
        </ItemSoldProvider>
      </StocksMgtProvider>
    </PaymentProvider>
  );
}

// ...existing code if any...
