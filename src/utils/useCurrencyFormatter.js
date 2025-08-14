import { useCallback, useMemo } from "react";

/**
 * A custom hook to provide a memoized currency formatting function.
 * This prevents the Intl.NumberFormat object from being recreated on every render.
 *
 * @param {object} options - Optional configuration for the formatter.
 * @param {string} [options.locale='en-PH'] - The locale string (e.g., 'en-US').
 * @param {string} [options.currency='PHP'] - The ISO currency code (e.g., 'USD').
 * @returns {function(number): string} A memoized function that takes a number and returns a formatted currency string.
 */
export const useCurrencyFormatter = (options = {}) => {
  const { locale = "en-PH", currency = "PHP" } = options;

  // useMemo ensures the formatter object itself is only created when locale or currency changes.
  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    });
  }, [locale, currency]);

  // useCallback ensures the function returned by the hook is stable,
  // preventing unnecessary re-renders in child components that receive it as a prop.
  const formatCurrency = useCallback(
    (value) => {
      return formatter.format(value || 0);
    },
    [formatter]
  );

  return formatCurrency;
};
