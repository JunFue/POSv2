import React from "react";
import { StocksMgtProvider } from "./StocksManagement.jsx";
import { ItemSoldProvider } from "./ItemSoldContext.jsx";
import { ItemRegProvider } from "./ItemRegContext.jsx";
import { CartProvider } from "./CartContext.jsx";

export function AppProviders({ children }) {
  return (
    <StocksMgtProvider>
      <ItemSoldProvider>
        <ItemRegProvider>
          <CartProvider>{children}</CartProvider>
        </ItemRegProvider>
      </ItemSoldProvider>
    </StocksMgtProvider>
  );
}

// ...existing code if any...
