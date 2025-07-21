import React from "react";
import { ItemSoldProvider } from "./ItemSoldContext.jsx";
import { ItemRegProvider } from "./ItemRegContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { PaymentProvider } from "./PaymentContext.jsx";
import { SettingsProvider } from "./SettingsContext.jsx";
import { ThemeProviders } from "./ThemeContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { InventoryProvider } from "./InventoryContext.jsx";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <InventoryProvider>
        <ThemeProviders>
          <SettingsProvider>
            <PaymentProvider>
              <ItemSoldProvider>
                <ItemRegProvider>
                  <CartProvider>{children}</CartProvider>
                </ItemRegProvider>
              </ItemSoldProvider>
            </PaymentProvider>
          </SettingsProvider>
        </ThemeProviders>
      </InventoryProvider>
    </AuthProvider>
  );
}

// ...existing code if any...
