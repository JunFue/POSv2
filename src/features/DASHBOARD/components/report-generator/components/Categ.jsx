import React from "react";
import { useCurrencyFormatter } from "./useCurrencyFormatter";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define a color palette for the chart segments for better visuals.
const COLORS = [
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#0088FE",
  "#AF19FF",
  "#FF1919",
];

/**
 * A component that displays a detailed breakdown for a single financial category,
 * including a visual pie chart for the expense breakdown.
 * @param {object} props - The component props.
 * @param {string} props.title - The title for the category section.
 * @param {object} props.categoryData - The data object for the category.
 */
const Categ = ({ title, categoryData }) => {
  const formatCurrency = useCurrencyFormatter();

  if (
    !categoryData ||
    !categoryData.expenseData ||
    categoryData.expenseData.values.length === 0
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-700 mb-4">{title}</h3>
        <p className="text-gray-500">
          No expense data available for this category.
        </p>
      </div>
    );
  }

  const { expenseData } = categoryData;

  // Calculate total expenses from the provided data.
  const totalExpenses = expenseData.values.reduce(
    (sum, value) => sum + value,
    0
  );

  // Prepare the data for the pie chart from the expenseData.
  const chartData = expenseData.labels.map((label, index) => ({
    name: label,
    value: expenseData.values[index],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-4">
        {/* Summary for the category */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-600">Total Expenses:</p>
          <p className="font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        {/* Chart Visualization for Expense Breakdown */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold text-gray-600 mb-2 text-center">
            Expense Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* List Breakdown of expenses */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold text-gray-600 mb-2">
            Expense Breakdown (List):
          </h4>
          <ul className="space-y-2">
            {chartData.map((item, index) => (
              <li
                key={index}
                className="flex justify-between text-sm text-gray-500"
              >
                <span>{item.name}</span>
                <span className="font-medium">
                  {formatCurrency(item.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Categ;
