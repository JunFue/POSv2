import React from "react";

const StatCard = ({ title, value, className }) => (
  <div className={`p-4 rounded-lg shadow-md ${className}`}>
    <h3 className="text-sm font-medium text-head-text">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-body-text">{value}</p>
  </div>
);

export function SalesSummaryCard({ data }) {
  const {
    grossSales,
    totalQuantitySold,
    freeQuantity,
    netQuantity,
    cashOnHand,
  } = data;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Today's Gross Sales"
        value={`₱${grossSales.toLocaleString()}`}
        className="bg-background text-body-text traditional-input"
      />
      <StatCard
        title="Total Quantity Sold"
        value={totalQuantitySold}
        className="bg-background text-body-text traditional-input"
      />
      <StatCard
        title="Free Quantity"
        value={freeQuantity}
        className="bg-background text-body-text traditional-input"
      />
      <StatCard
        title="Net Quantity"
        value={netQuantity}
        className="bg-background text-body-text traditional-input"
      />
      {/* --- New StatCard for Cash on Hand --- */}
      <StatCard
        title="Cash on Hand"
        value={`₱${cashOnHand?.toLocaleString() || 0}`}
        className="bg-background text-body-text traditional-input"
      />
    </div>
  );
}
