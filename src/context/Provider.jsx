import React from "react";
import { ItemSoldProvider } from "./ItemSoldContext.jsx";
import { ItemRegProvider } from "./ItemRegContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { PaymentProvider } from "./PaymentContext.jsx";
import { SettingsProvider } from "./SettingsContext.jsx";
import { ThemeProviders } from "./ThemeContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { InventoryProvider } from "./InventoryContext.jsx";
import { CashoutProvider } from "./CashoutProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AppProviders({ children }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CashoutProvider>
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
        </CashoutProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// ...existing code if any...
