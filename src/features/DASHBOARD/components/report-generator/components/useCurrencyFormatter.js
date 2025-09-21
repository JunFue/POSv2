import { useCallback } from "react";

/**
 * A custom React hook for formatting numbers as Philippine Pesos (PHP).
 * This hook returns a stable, memoized function to prevent re-renders.
 *
 * @returns {function(number): string} A memoized function that takes a numeric value
 * and returns it as a currency string (e.g., "₱1,234.56").
 */
export const useCurrencyFormatter = () => {
  // useCallback ensures the formatting function is not recreated on every render,
  // which is a performance best practice.
  const formatCurrency = useCallback((value) => {
    // Provide a sensible default if the value isn't a number.
    if (typeof value !== "number") {
      return "₱0.00";
    }

    // Use the Intl.NumberFormat API to format the number as PHP currency.
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  }, []); // The empty dependency array means this function is created only once.

  return formatCurrency;
};
