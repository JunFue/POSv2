import React from "react";
import { useParams } from "react-router";
import {
  salesTodayData,
  monthlyLogData,
  summaryCardData,
} from "./data/dummyData.js";
import { SalesSummaryCard } from "./components/SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./components/ItemSoldTable.jsx";
import { MonthlyLogTable } from "./components/MonthlyLogTable.jsx";

export function CategoryPage() {
  const { categoryName } = useParams();

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Category: {categoryName}
      </h1>
      <p className="text-gray-600 mb-6">
        Sales and logs for the current category.
      </p>

      {/* Render the new components with dummy data */}
      <SalesSummaryCard data={summaryCardData} />
      <ItemsSoldTable data={salesTodayData} />
      <MonthlyLogTable data={monthlyLogData} />
    </div>
  );
}
