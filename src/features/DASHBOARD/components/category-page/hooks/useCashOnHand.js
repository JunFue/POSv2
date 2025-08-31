import { useMemo } from "react";
import { useCashout } from "../../../../../context/CashoutProvider";
import { useCategoricalGrossSales } from "./useCategoricalGrossSales";

export const useCashOnHand = (categoryName) => {
  // 1. Get the gross sales for the current category.
  const { grossSales } = useCategoricalGrossSales(categoryName);

  // Get the cashouts from the context.
  const { cashouts } = useCashout();

  // 2. Compute the total cashout amount for the current category.
  const totalCashout = useMemo(() => {
    const cashoutList = Array.isArray(cashouts) ? cashouts : [];
    if (!categoryName || cashoutList.length === 0) {
      return 0;
    }

    return cashoutList
      .filter((cashout) => cashout.category === categoryName)
      .reduce((sum, cashout) => sum + parseFloat(cashout.amount || 0), 0);
  }, [cashouts, categoryName]);

  // 3. Subtract the cashout total from the gross sales.
  const cashOnHand = useMemo(() => {
    return grossSales - totalCashout;
  }, [grossSales, totalCashout]);

  return cashOnHand;
};
