import { cat1Data, cat2Data } from "./mockdata";
import { useCurrencyFormatter } from "./useCurrencyFormatter";

export const OverallSummary = () => {
  // Call the custom hook to get the formatting function.
  const formatCurrency = useCurrencyFormatter();

  // Calculate total revenue by summing up totalSales from both categories
  const totalRevenue = cat1Data.totalSales + cat2Data.totalSales;

  // Calculate total expenses by summing up expenses from both categories
  const totalExpenses = cat1Data.expenses + cat2Data.expenses;

  // Calculate net income
  const netIncome = totalRevenue - totalExpenses;

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
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Net Income
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>
    </section>
  );
};
