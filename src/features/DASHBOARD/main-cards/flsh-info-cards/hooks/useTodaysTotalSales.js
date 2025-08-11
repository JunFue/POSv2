import { usePaymentContext } from "../../../../../context/PaymentContext";

/**
 * A custom hook that retrieves the pre-calculated total net sales for today.
 * The calculation logic now resides within the PaymentContext, ensuring
 * the value is always in sync with the list of payments.
 *
 * @returns {number} The total net sales amount for today.
 */
export function useTodaysTotalSales() {
  // Simply retrieve the pre-calculated value from the context.
  const { todaysNetSales } = usePaymentContext();
  return todaysNetSales;
}
