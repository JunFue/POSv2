import React from "react";

const StatCard = ({ title, value, className }) => (
  <div className={`p-4 rounded-lg shadow-md ${className}`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

export function SalesSummaryCard({ data }) {
  const { grossSales, totalQuantitySold, freeQuantity, netQuantity } = data;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gross Sales"
        value={`₱${grossSales.toLocaleString()}`}
        className="bg-blue-100"
      />
      <StatCard
        title="Total Quantity Sold"
        value={totalQuantitySold}
        className="bg-green-100"
      />
      <StatCard
        title="Free Quantity"
        value={freeQuantity}
        className="bg-yellow-100"
      />
      <StatCard
        title="Net Quantity"
        value={netQuantity}
        className="bg-indigo-100"
      />
    </div>
  );
}
