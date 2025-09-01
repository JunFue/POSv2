import { useMemo } from "react";
import { useCategoricalGrossSales } from "./useCategoricalGrossSales";
import { useCashout } from "../../../../../context/CashoutProvider";

export const useCashOnHand = (categoryName) => {
  const { grossSales } = useCategoricalGrossSales(categoryName);
  const { cashouts } = useCashout();

  console.log("[useCashOnHand] Gross Sales Input:", grossSales);
  console.log("[useCashOnHand] All Cashouts from Context:", cashouts);

  const totalCashout = useMemo(() => {
    const cashoutList = Array.isArray(cashouts) ? cashouts : [];
    if (!categoryName || cashoutList.length === 0) {
      return 0;
    }

    const filteredCashouts = cashoutList.filter(
      (cashout) => cashout.category === categoryName
    );

    console.log(
      `[useCashOnHand] Filtered Cashouts for ${categoryName}:`,
      filteredCashouts
    );

    const total = filteredCashouts.reduce(
      (sum, cashout) => sum + parseFloat(cashout.amount || 0),
      0
    );

    console.log(`[useCashOnHand] Total Cashout for ${categoryName}:`, total);
    return total;
  }, [cashouts, categoryName]);

  const cashOnHand = useMemo(() => {
    const result = grossSales - totalCashout;
    console.log(
      `[useCashOnHand] Final Calculation: ${grossSales} - ${totalCashout} = ${result}`
    );
    return result;
  }, [grossSales, totalCashout]);

  return cashOnHand;
};
