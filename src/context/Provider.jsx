import React from "react";
import { StocksMgtProvider } from "./StocksManagement.jsx";
import { ItemSoldProvider } from "./ItemSoldContext.jsx";
import { ItemRegProvider } from "./ItemRegContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { PaymentProvider } from "./PaymentContext.jsx";
import { SettingsProvider } from "./SettingsContext.jsx";
import { ThemeProviders } from "./ThemeContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProviders>
        <SettingsProvider>
          <PaymentProvider>
            <StocksMgtProvider>
              <ItemSoldProvider>
                <ItemRegProvider>
                  <CartProvider>{children}</CartProvider>
                </ItemRegProvider>
              </ItemSoldProvider>
            </StocksMgtProvider>
          </PaymentProvider>
        </SettingsProvider>
      </ThemeProviders>
    </AuthProvider>
  );
}

// ...existing code if any...
