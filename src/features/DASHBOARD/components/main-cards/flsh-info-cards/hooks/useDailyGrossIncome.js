import { useMemo } from "react";

/**
 * A custom hook to calculate daily gross income from a list of payments.
 * Daily gross income is calculated as gross sales minus total discounts.
 * This hook uses useMemo to optimize performance by memoizing the result.
 * @param {Array} payments - An array of payment objects.
 * @returns {number} The calculated daily gross income.
 */
export const useDailyGrossIncome = (payments) => {
  // useMemo will only re-evaluate when the 'payments' array changes.
  const dailyGrossIncome = useMemo(() => {
    // If payments is not an array, default to 0.
    if (!Array.isArray(payments)) {
      return 0;
    }

    // Calculate gross sales by summing up the amount from each payment.
    const grossSales = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount_to_pay || p.amountToPay || 0),
      0
    );

    // Calculate the total discount from all payments.
    const totalDiscount = payments.reduce(
      (sum, p) => sum + parseFloat(p.discount || 0),
      0
    );

    // The daily gross income is gross sales minus the total discount.
    return grossSales - totalDiscount;
  }, [payments]); // Dependency array ensures this runs only when payments change.

  return dailyGrossIncome;
};
