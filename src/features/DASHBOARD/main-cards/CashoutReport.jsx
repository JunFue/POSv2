import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../AUTHENTICATION/hooks/useAuth";
import { format, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ReportCalendar } from "../components/ReportCalendar";
import {
  getMonthlyTotalExpenses,
  getMonthlyBreakdown,
  getDailyCashouts,
} from "../services/reportService";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

export function CashoutReport() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [monthlyRange, setMonthlyRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [dailyDate, setDailyDate] = useState(new Date());

  const [totalDailyExpenses, setTotalDailyExpenses] = useState(0);
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
  const [dailyExpensesList, setDailyExpensesList] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);

  // --- Custom Label Renderer for Pie Chart ---
  const renderPieLabel = ({
    value,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    // Position the label inside the slice for a cleaner look
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Don't render a label for very small slices to avoid clutter
    if (percent < 0.05) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  const fetchMonthlyData = useCallback(
    async (range) => {
      if (!token) return;
      try {
        const totalData = await getMonthlyTotalExpenses(token, range);
        setTotalMonthlyExpenses(totalData.totalExpenses || 0);

        const breakdownData = await getMonthlyBreakdown(token, range);
        // Ensure breakdownData is always an array
        setMonthlyBreakdown(Array.isArray(breakdownData) ? breakdownData : []);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        setTotalMonthlyExpenses(0);
        setMonthlyBreakdown([]);
      }
    },
    [token]
  );

  const fetchDailyData = useCallback(
    async (date) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getDailyCashouts(token, date);
        setDailyExpensesList(data || []);
        const dailyTotal = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalDailyExpenses(dailyTotal);
      } catch (error) {
        console.error("Error fetching daily data:", error);
        setDailyExpensesList([]);
        setTotalDailyExpenses(0);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchMonthlyData(monthlyRange);
  }, [fetchMonthlyData, monthlyRange]);

  useEffect(() => {
    fetchDailyData(dailyDate);
  }, [fetchDailyData, dailyDate]);

  const handleDateChange = (newDate) => {
    setDailyDate(newDate);
  };

  return (
    <div className="w-full h-full p-4 bg-gray-800 text-body-text rounded-lg flex flex-col gap-6">
      {/* Header and Stats */}
      <div className="flex justify-end items-start">
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Today's Expenses</p>
            <p className="text-lg font-bold">
              {formatCurrency(totalDailyExpenses)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-xs text-gray-400">Monthly Total</p>
              <FaCalendarAlt
                className="cursor-pointer hover:text-blue-400"
                onClick={() => setIsCalendarOpen(true)}
              />
            </div>
            <p className="text-lg font-bold">
              {formatCurrency(totalMonthlyExpenses)}
            </p>
          </div>
        </div>
      </div>

      {isCalendarOpen && (
        <ReportCalendar
          onSet={setMonthlyRange}
          initialRange={monthlyRange}
          closeCalendar={() => setIsCalendarOpen(false)}
        />
      )}

      {/* Main Content: Chart and Table */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Pie Chart */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Monthly Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">{`${format(
            monthlyRange.from,
            "MMM d"
          )} - ${format(monthlyRange.to, "MMM d, yyyy")}`}</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={monthlyBreakdown}
                dataKey="total_amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
                label={renderPieLabel}
              >
                {monthlyBreakdown.map((entry, index) => (
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

        {/* Right Side: Daily Expenses Table */}
        <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Daily Expenses</h3>
            <div className="flex items-center gap-2">
              <FaArrowLeft
                className="cursor-pointer"
                onClick={() => handleDateChange(subDays(dailyDate, 1))}
              />
              <span className="text-sm font-semibold">
                {format(dailyDate, "MMM d, yyyy")}
              </span>
              <FaArrowRight
                className="cursor-pointer"
                onClick={() => handleDateChange(addDays(dailyDate, 1))}
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-2">
                      Notes
                    </th>
                    <th scope="col" className="px-4 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyExpensesList.length > 0 ? (
                    dailyExpensesList.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-700 hover:bg-gray-600"
                      >
                        <td className="px-4 py-2 font-medium">
                          {item.category}
                        </td>
                        <td className="px-4 py-2 text-head-text">
                          {item.notes}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-gray-500"
                      >
                        No expenses for this day.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
