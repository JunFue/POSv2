import { useMemo } from "react";
import { useMonthlyReport } from "../../../../../context/MonthlyReportContext";
import { eachDayOfInterval, format, startOfDay } from "date-fns";
import { useParams } from "react-router";

const formatDate = (date) => format(new Date(date), "yyyy-MM-dd");

export function useMonthlyLogData() {
  const { reportData, dateRange } = useMonthlyReport();
  const { categoryName } = useParams();

  const dailyLogs = useMemo(() => {
    if (!reportData || !dateRange || !dateRange.from || !dateRange.to) {
      return [];
    }

    const allDatesInRange = eachDayOfInterval({
      start: startOfDay(dateRange.from),
      end: startOfDay(dateRange.to),
    }).map(formatDate);

    // --- 1. Calculate total sales for the category per day ---
    const transactionsByDate = (reportData.tableOneData || [])
      .filter((t) => t.classification === categoryName)
      .reduce((acc, t) => {
        const date = formatDate(t.transactionDate);
        if (!acc[date]) acc[date] = 0;
        acc[date] += parseFloat(t.totalPrice);
        return acc;
      }, {});

    // --- 2. Calculate total discounts per day (from all categories) ---
    const discountsByDate = (reportData.paymentsData || []).reduce((acc, p) => {
      const date = formatDate(p.transaction_date);
      if (!acc[date]) acc[date] = 0;
      acc[date] += parseFloat(p.discount);
      return acc;
    }, {});

    // --- 3. Calculate total cashouts for the category per day ---
    const cashoutsByDate = (reportData.tableTwoData || [])
      .filter((c) => c.category === categoryName)
      .reduce((acc, c) => {
        const date = formatDate(c.cashout_date);
        if (!acc[date]) acc[date] = 0;
        acc[date] += parseFloat(c.amount);
        return acc;
      }, {});

    let runningBalance = 0;
    const logs = allDatesInRange.map((dateStr) => {
      const forwarded = runningBalance;

      // Get the gross cash-in from sales
      let grossCashIn = transactionsByDate[dateStr] || 0;

      // Get the total discount for the day
      const dailyDiscount = discountsByDate[dateStr] || 0;

      // --- 4. Apply the discount logic ---
      // If the category is "DETOX", subtract the day's total discount
      const finalCashIn =
        categoryName === "DETOX" ? grossCashIn - dailyDiscount : grossCashIn;

      const cashOut = cashoutsByDate[dateStr] || 0;
      const balance = forwarded + finalCashIn - cashOut;
      runningBalance = balance;

      return {
        date: dateStr,
        forwarded,
        cashIn: finalCashIn, // Use the final, adjusted value
        cashOut,
        balance,
      };
    });

    return logs;
  }, [reportData, dateRange, categoryName]);

  return dailyLogs;
}
