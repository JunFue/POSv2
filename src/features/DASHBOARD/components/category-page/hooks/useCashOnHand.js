import { useMemo } from "react";
import { useCategoricalGrossSales } from "./useCategoricalGrossSales";
import { useCashout } from "../../../../../context/CashoutProvider";

export const useCashOnHand = (categoryName) => {
  const { grossSales } = useCategoricalGrossSales(categoryName);
  const { cashouts } = useCashout();

  const totalCashout = useMemo(() => {
    const cashoutList = Array.isArray(cashouts) ? cashouts : [];
    if (!categoryName || cashoutList.length === 0) {
      return 0;
    }

    const filteredCashouts = cashoutList.filter(
      (cashout) => cashout.category === categoryName
    );

    const total = filteredCashouts.reduce(
      (sum, cashout) => sum + parseFloat(cashout.amount || 0),
      0
    );

    return total;
  }, [cashouts, categoryName]);

  const cashOnHand = useMemo(() => {
    const result = grossSales - totalCashout;

    return result;
  }, [grossSales, totalCashout]);

  return cashOnHand;
};
