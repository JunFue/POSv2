import { useMemo } from "react";
import { useCashout } from "../../../../../context/CashoutProvider";

/**
 * A custom hook that calculates the total cashout amount for a specific category.
 * @param {string} categoryName - The name of the category to filter by.
 * @returns {number} The total cashout amount for the given category.
 */
export const useTotalCashoutByCategory = (categoryName) => {
  const { cashouts } = useCashout();

  const totalCashout = useMemo(() => {
    // Return 0 if cashouts or categoryName are not available
    if (!cashouts || !categoryName) {
      return 0;
    }

    // Filter cashouts by the provided categoryName and sum up the amounts
    return cashouts
      .filter((cashout) => cashout.category === categoryName)
      .reduce((total, cashout) => total + (cashout.amount || 0), 0);
  }, [cashouts, categoryName]);

  return totalCashout;
};
