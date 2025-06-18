import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

export function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let stored = localStorage.getItem("overviewData");
    if (!stored) {
      const dummyData = {
        income: 7500,
        expenses: 4000,
        net: 3500,
        detailedExpenses: [
          { category: "Food", amount: 1200 },
          { category: "Transport", amount: 800 },
          { category: "Utilities", amount: 500 },
          { category: "Entertainment", amount: 600 },
          { category: "Health", amount: 400 },
          { category: "Other", amount: 500 },
        ],
      };
      localStorage.setItem("overviewData", JSON.stringify(dummyData));
      stored = JSON.stringify(dummyData);
    }
    setData(JSON.parse(stored));
  }, []);

  if (!data) return <div>Loading...</div>;

  const pieData = [
    { name: "Income", value: data.income },
    { name: "Expenses", value: data.expenses },
  ];
  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className="w-full h-full p-4 custom-gradient rounded-lg border border-accent-800 shadow-md text-accent-50 font-info-text!">
      <h2 className="text-3xl mb-2">Overview</h2>
      <div className="p-6 grid gap-8">
        {/* Financial Overview Section */}
        <section className="bg-white/40 backdrop-blur-md rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            Today's Financial Overview
          </h2>
          <div className="flex justify-around mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                ₱{data.income}
              </div>
              <div className="text-sm text-gray-500">Income</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">
                ₱{data.expenses}
              </div>
              <div className="text-sm text-gray-500">Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">₱{data.net}</div>
              <div className="text-sm text-gray-500">Net Income</div>
            </div>
          </div>
          <div className="flex justify-center">
            <PieChart width={250} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </section>

        {/* Detailed Expenses Section with Radar Chart */}
        <section className="bg-white/40 backdrop-blur-md rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            Today's Detailed Expenses
          </h2>
          <div className="mb-3 text-center">
            <div className="text-xl font-bold text-red-600">
              Total Expenses: ₱{data.expenses}
            </div>
          </div>
          <div className="flex justify-center">
            <RadarChart
              outerRadius={80}
              width={400}
              height={250}
              data={data.detailedExpenses}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 12 }} />
              <Radar
                name="Expenses"
                dataKey="amount"
                stroke="#FF8042"
                fill="#FF8042"
                fillOpacity={0.6}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </RadarChart>
          </div>
        </section>
      </div>
    </div>
  );
}
