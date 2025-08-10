import { useMemo, useState } from "react";

export function useQueryState() {
  const today = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [dateRange, setDateRange] = useState({ from: today, to: today });
  const [transactionNo, setTransactionNo] = useState("");

  const isViewingToday = useMemo(() => {
    return (
      dateRange.from === today &&
      dateRange.to === today &&
      transactionNo.trim() === ""
    );
  }, [dateRange, today, transactionNo]);

  const resetQuery = () => {
    setDateRange({ from: today, to: today });
    setTransactionNo("");
  };

  return {
    today,
    dateRange,
    setDateRange,
    transactionNo,
    setTransactionNo,
    isViewingToday,
    resetQuery,
  };
}
