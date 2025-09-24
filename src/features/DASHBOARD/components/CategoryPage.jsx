import React, { useContext, useMemo } from "react";
import { useParams } from "react-router";
import { SalesSummaryCard } from "./category-page/SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./category-page/ItemSoldTable.jsx";
import { MonthlyLogTable } from "./category-page/MonthlyLogTable.jsx";
import { useCategoricalGrossSales } from "./category-page/hooks/useCategoricalGrossSales.js";
import { useCashOnHand } from "./category-page/hooks/useCashOnHand.js";
import { useTotalCashoutByCategory } from "./category-page/hooks/useTotalCashoutByCategory.js";
import { ItemSoldContext } from "../../../context/ItemSoldContext.jsx";

export function CategoryPage({
  categoryName: categoryNameProp,
  isWidget = false,
}) {
  const { categoryName: categoryNameFromURL } = useParams();
  const categoryName = categoryNameProp || categoryNameFromURL;

  const { grossSales } = useCategoricalGrossSales(categoryName);
  const cashOnHand = useCashOnHand(categoryName);
  const totalCashout = useTotalCashoutByCategory(categoryName);
  const { todaysItemSold } = useContext(ItemSoldContext);

  const itemsSoldData = useMemo(() => {
    if (!todaysItemSold || !Array.isArray(todaysItemSold.data)) {
      return [];
    }

    const categoryItems = todaysItemSold.data.filter(
      (item) => item.classification === categoryName
    );

    const aggregated = categoryItems.reduce((acc, item) => {
      if (!acc[item.itemName]) {
        acc[item.itemName] = {
          id: item.itemName,
          item: item.itemName,
          unitsSold: 0,
          totalSales: 0,
        };
      }
      acc[item.itemName].unitsSold += Number(item.quantity);
      acc[item.itemName].totalSales += Number(item.totalPrice);
      return acc;
    }, {});

    return Object.values(aggregated);
  }, [todaysItemSold, categoryName]);

  return (
    <div className={isWidget ? "h-full" : "p-6 bg-background min-h-screen"}>
      {!isWidget && (
        <>
          <h1 className="text-3xl font-bold text-gray-800">
            Category: {categoryName}
          </h1>
          <p className="text-gray-600 mb-6">
            Sales and logs for the current category, computed in real-time.
          </p>
        </>
      )}

      <SalesSummaryCard
        data={{
          grossSales,
          cashOnHand,
          totalCashout,
          totalQuantitySold: "N/A",
          freeQuantity: "N/A",
          netQuantity: "N/A",
        }}
      />

      <ItemsSoldTable data={itemsSoldData} />
      <MonthlyLogTable data={[]} />
    </div>
  );
}
