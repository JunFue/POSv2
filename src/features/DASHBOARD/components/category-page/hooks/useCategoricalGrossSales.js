import { useState, useMemo, useContext, useEffect } from "react";
import { ItemSoldContext } from "../../../../../context/ItemSoldContext";
import { PaymentContext } from "../../../../../context/PaymentContext";

/**
 * A custom hook to compute categorical sales data purely from client-side context.
 * @param {string} categoryName - The name of the category from the URL parameters.
 * @returns {{grossSales: number, chartData: Array<object>}}
 */
export const useCategoricalGrossSales = (categoryName) => {
  const { todaysItemSold } = useContext(ItemSoldContext);
  const { todaysPayments } = useContext(PaymentContext);

  // Instantly compute total gross sales from local context data.
  const localGrossSales = useMemo(() => {
    const items = Array.isArray(todaysItemSold?.data)
      ? todaysItemSold.data
      : [];
    if (!categoryName || items.length === 0) {
      return 0;
    }

    const totalFromItems = items
      .filter((item) => item.classification === categoryName)
      .reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);

    if (categoryName !== "DETOX") {
      return totalFromItems;
    }

    const payments = Array.isArray(todaysPayments) ? todaysPayments : [];
    const totalDiscount = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.discount || 0),
      0
    );

    return totalFromItems - totalDiscount;
  }, [todaysItemSold, todaysPayments, categoryName]);

  const [displayGrossSales, setDisplayGrossSales] = useState(localGrossSales);

  // Effect to update the displayed sales whenever the local calculation changes.
  useEffect(() => {
    setDisplayGrossSales(localGrossSales);
  }, [localGrossSales]);

  return { grossSales: displayGrossSales };
};
