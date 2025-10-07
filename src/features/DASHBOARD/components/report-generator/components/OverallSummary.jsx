import { useEffect, useState } from "react";
import { useMonthlyReport } from "../../../../../context/MonthlyReportContext";
import { useCurrencyFormatter } from "./useCurrencyFormatter";
import { getMonthlyIncome } from "../../../../../api/dashboardService";

export const OverallSummary = () => {
  const formatCurrency = useCurrencyFormatter();
  const { dateRange } = useMonthlyReport();
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const fetchData = async () => {
        console.log("Fetching data for date range:", dateRange);
        setIsLoading(true);
        setError(null);
        try {
          console.log("Attempting to fetch monthly income...");
          const incomeData = await getMonthlyIncome(dateRange);
          console.log("Successfully fetched income data:", incomeData);

          // Assuming the API returns an object with a 'totalNetIncome' property
          const totalRevenue = incomeData.totalNetIncome || 0;

          // --- MOCK DATA (to be replaced) ---
          const totalExpenses = 15000; // Replace with API call
          const netIncome = totalRevenue - totalExpenses;

          setSummaryData({ totalRevenue, totalExpenses, netIncome });
        } catch (err) {
          setError("Failed to fetch summary data.");
          console.error("Error fetching summary data:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [dateRange]);

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
