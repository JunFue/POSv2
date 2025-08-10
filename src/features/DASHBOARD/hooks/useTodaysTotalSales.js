import { useContext, useMemo } from "react";
import { ItemSoldContext } from "../../../context/ItemSoldContext";

/**
 * A custom hook that calculates the total net sales for the current day.
 * It sums the total price of all items sold and subtracts the total
 * discount applied to those transactions.
 *
 * @returns {number} The total net sales amount for today.
 */
export function useTodaysTotalSales() {
  const { todaysItemSold } = useContext(ItemSoldContext);

  const netSales = useMemo(() => {
    const items = todaysItemSold?.data;
    if (!Array.isArray(items) || items.length === 0) {
      return 0;
    }

    // 1. Calculate the total gross sales by summing up every item's total price.
    const grossSales = items.reduce((sum, item) => sum + +item.totalPrice, 0);

    // 2. Calculate the total discount.
    // To avoid double-counting, we first find the discount for each unique transaction.
    const transactionDiscounts = new Map();
    for (const item of items) {
      // The discount is the same for all items in a transaction, so we can just set it.
      if (item.transactionNo && item.discount > 0) {
        transactionDiscounts.set(item.transactionNo, +item.discount);
      }
    }

    // Sum the discounts from each unique transaction.
    const totalDiscount = Array.from(transactionDiscounts.values()).reduce(
      (sum, discount) => sum + discount,
      0
    );

    // 3. Return the net sales.
    return grossSales - totalDiscount;
  }, [todaysItemSold]);

  return netSales;
}
