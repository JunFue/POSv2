import { useMemo } from "react";

/**
 * A custom hook to calculate net sales from a list of payments and total cashouts.
 * This hook uses useMemo to optimize performance by memoizing the result.
 * @param {Array} payments - An array of payment objects.
 * @param {number} totalCashouts - The total amount of cashouts.
 * @returns {number} The calculated net sales.
 */
export const useNetSales = (payments, totalCashouts) => {
  // useMemo will only re-calculate the value when 'payments' or 'totalCashouts' changes.
  const netSales = useMemo(() => {
    // Return a default value if payments is not a valid array.
    if (!Array.isArray(payments)) {
      return 0 - totalCashouts;
    }

    // Calculate gross sales by summing up the amount to pay from each payment.
    const grossSales = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount_to_pay || p.amountToPay || 0),
      0
    );

    // Calculate the total discount from all payments.
    const totalDiscount = payments.reduce(
      (sum, p) => sum + parseFloat(p.discount || 0),
      0
    );

    // Calculate net sales by subtracting discounts and cashouts from gross sales.
    return grossSales - totalDiscount - totalCashouts;
  }, [payments, totalCashouts]); // Dependencies for the memoization

  return netSales;
};
