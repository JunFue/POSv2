import { useMemo } from "react";

/**
 * A custom hook to calculate gross sales from a list of payments.
 * Gross Sales = (Sum of all payment amounts) - (Sum of all discounts).
 * This hook uses useMemo to optimize performance by memoizing the result.
 * @param {Array} payments - An array of payment objects.
 * @returns {number} The calculated gross sales.
 */
export const useGrossSales = (payments) => {
  // useMemo will only re-calculate the value when the 'payments' array changes.
  const totalSales = useMemo(() => {
    // Return 0 if payments is not a valid array to prevent errors.
    if (!Array.isArray(payments)) {
      return 0;
    }

    // Calculate the total payment amount by summing up 'amount_to_pay' from each payment.
    const grossAmount = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount_to_pay || p.amountToPay || 0),
      0
    );

    // Calculate the total discount from all payments.
    const totalDiscount = payments.reduce(
      (sum, p) => sum + parseFloat(p.discount || 0),
      0
    );

    // Calculate the final total sales by subtracting discounts from the gross amount.
    return grossAmount - totalDiscount;
  }, [payments]); // Dependency for the memoization

  return totalSales;
};
