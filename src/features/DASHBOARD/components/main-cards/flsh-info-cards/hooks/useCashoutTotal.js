import { useMemo } from "react";
import { useCashout } from "../../../../../../context/CashoutProvider";

/**
 * A custom hook that calculates the total amount from the cashouts state.
 * It uses useMemo for performance optimization, only recalculating when
 * the cashouts data changes.
 *
 * @returns {number} The total cashout amount.
 */
export function useCashoutTotal() {
  const { cashouts } = useCashout();

  const total = useMemo(() => {
    // Return 0 if cashouts is not an array or is empty
    if (!Array.isArray(cashouts) || cashouts.length === 0) {
      return 0;
    }

    // Use reduce to sum up the amounts of all cashout records
    return cashouts.reduce((acc, currentCashout) => {
      // Ensure the amount is a number before adding it to the accumulator
      const amount = parseFloat(currentCashout.amount) || 0;
      return acc + amount;
    }, 0);
  }, [cashouts]); // Dependency array: only recalculate when cashouts change

  return total;
}
