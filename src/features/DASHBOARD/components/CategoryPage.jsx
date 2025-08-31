import React from "react";
import { useParams } from "react-router";
import { SalesSummaryCard } from "./category-page/SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./category-page/ItemSoldTable.jsx";
import { MonthlyLogTable } from "./category-page/MonthlyLogTable.jsx";
import { useCategoricalGrossSales } from "./category-page/hooks/useCategoricalGrossSales.js";

export function CategoryPage() {
  const { categoryName } = useParams();

  // The hook now only returns the computed data.
  const { grossSales } = useCategoricalGrossSales(categoryName);

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Category: {categoryName}
      </h1>
      <p className="text-gray-600 mb-6">
        Sales and logs for the current category, computed in real-time.
      </p>

      <SalesSummaryCard
        data={{
          grossSales,
          totalQuantitySold: "N/A",
          freeQuantity: "N/A",
          netQuantity: "N/A",
        }}
      />

      <ItemsSoldTable data={[]} />
      <MonthlyLogTable data={[]} />
    </div>
  );
}
