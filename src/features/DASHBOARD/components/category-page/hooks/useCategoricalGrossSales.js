import { useState, useMemo, useContext, useCallback, useEffect } from "react";
import { ItemSoldContext } from "../../../../../context/ItemSoldContext";
import { PaymentContext } from "../../../../../context/PaymentContext";
import { useAuth } from "../../../../AUTHENTICATION/hooks/useAuth";
import { getCategoricalSales } from "../../../../../api/categoryPageService";

/**
 * A custom hook to compute categorical sales data, including special discount logic.
 * @param {string} categoryName - The name of the category from the URL parameters.
 * @returns {{grossSales: number, chartData: Array<object>, syncWithServer: Function, error: string|null}}
 */
export const useCategoricalGrossSales = (categoryName) => {
  const { todaysItemSold } = useContext(ItemSoldContext);
  const { todaysPayments } = useContext(PaymentContext);
  const { user } = useAuth();
  const [error, setError] = useState(null);

  // Instantly compute total gross sales from local context data.
  const localGrossSales = useMemo(() => {
    const items = Array.isArray(todaysItemSold?.data)
      ? todaysItemSold.data
      : [];
    if (!categoryName || items.length === 0) {
      return 0;
    }

    // First, calculate the base total price from all items sold in the category.
    const totalFromItems = items
      .filter((item) => item.classification === categoryName)
      .reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);

    // For categories other than "DETOX", no special logic is needed.
    if (categoryName !== "DETOX") {
      return totalFromItems;
    }

    // Apply discount logic ONLY for the 'DETOX' category.
    const payments = Array.isArray(todaysPayments) ? todaysPayments : [];
    const totalDiscount = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.discount || 0),
      0
    );

    return totalFromItems - totalDiscount;
  }, [todaysItemSold, todaysPayments, categoryName]);

  const [displayGrossSales, setDisplayGrossSales] = useState(localGrossSales);

  // This effect ensures the displayed sales updates whenever the local calculation changes.
  useEffect(() => {
    setDisplayGrossSales(localGrossSales);
  }, [localGrossSales]);

  // Instantly compute the data aggregated for the bar chart.
  const chartData = useMemo(() => {
    const items = Array.isArray(todaysItemSold?.data)
      ? todaysItemSold.data
      : [];
    if (items.length === 0) {
      return [];
    }
    const categoryItems = items.filter(
      (item) => item.classification === categoryName
    );
    const salesByItem = categoryItems.reduce((acc, item) => {
      const itemName = item.itemName;
      const price = parseFloat(item.totalPrice || 0);
      if (!acc[itemName]) {
        acc[itemName] = { name: itemName, sales: 0 };
      }
      acc[itemName].sales += price;
      return acc;
    }, {});
    return Object.values(salesByItem);
  }, [todaysItemSold, categoryName]);

  // A function to sync with the backend to verify the true total gross sales.
  const syncWithServer = useCallback(async () => {
    if (!categoryName || !user?.id) return;
    try {
      setError(null);
      const today = new Date().toISOString().split("T")[0];
      const result = await getCategoricalSales(today, categoryName, user.id);
      // Note: The server sync will overwrite the local calculation.
      // Your backend may need to be updated to also calculate the DETOX discount.
      setDisplayGrossSales(result.totalSales);
    } catch (err) {
      setError("Failed to sync sales data with the server.");
      console.error(err);
    }
  }, [categoryName, user]);

  return { grossSales: displayGrossSales, chartData, syncWithServer, error };
};
