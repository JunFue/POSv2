import { useEffect, useState } from "react";
import { useMonthlyReport } from "../../../../../context/MonthlyReportContext";
import { useCurrencyFormatter } from "./useCurrencyFormatter";
import { getMonthlyIncome } from "../../../../../api/dashboardService";
// --- UPDATED IMPORT ---
import { useCashout } from "../../../../../context/CashoutProvider";

export const OverallSummary = () => {
  const formatCurrency = useCurrencyFormatter();
  const { dateRange } = useMonthlyReport();

  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
  });

  // State for income data
  const [incomeData, setIncomeData] = useState(null);
  const [incomeLoading, setIncomeLoading] = useState(true);
  const [incomeError, setIncomeError] = useState(null);

  // --- UPDATED HOOK USAGE ---
  // Get cashouts (expenses) from the CashoutProvider context.
  // The provider is expected to handle filtering by the dateRange internally.
  const {
    cashouts,
    loading: cashoutsLoading,
    error: cashoutsError,
  } = useCashout();

  // Effect for fetching income data
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const fetchIncome = async () => {
        setIncomeLoading(true);
        setIncomeError(null);
        try {
          const data = await getMonthlyIncome(dateRange);

          setIncomeData(data);
        } catch (err) {
          setIncomeError("Failed to fetch summary data.");
          console.error("Error fetching summary data:", err);
        } finally {
          setIncomeLoading(false);
        }
      };
      fetchIncome();
    }
  }, [dateRange]);

  // Effect for calculating summary data when both income and expenses are fetched
  useEffect(() => {
    // Only calculate if both data sources have a valid value.
    if (incomeData && cashouts) {
      const totalRevenue = incomeData.totalNetIncome || 0;

      // Defensively calculate total expenses, ensuring cashouts is an array.
      const totalExpenses = Array.isArray(cashouts)
        ? cashouts.reduce((sum, expense) => sum + (expense.amount || 0), 0)
        : 0;

      const netIncome = totalRevenue - totalExpenses;

      setSummaryData({ totalRevenue, totalExpenses, netIncome });
    }
  }, [incomeData, cashouts]);

  // Combine loading and error states from both hooks for the UI
  const isLoading = incomeLoading || cashoutsLoading;
  const error = incomeError || cashoutsError;

  if (isLoading) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          A. Overall Summary
        </h2>
        <p>Loading summary...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          A. Overall Summary
        </h2>
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">
        A. Overall Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summaryData.totalRevenue)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(summaryData.totalExpenses)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Net Income
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(summaryData.netIncome)}
          </p>
        </div>
      </div>
    </section>
  );
};
