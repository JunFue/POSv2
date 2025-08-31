import React, { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { SalesSummaryCard } from "./category-page/SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./category-page/ItemSoldTable.jsx";
import { MonthlyLogTable } from "./category-page/MonthlyLogTable.jsx";
import { supabase } from "../../../utils/supabaseClient.js";
import { usePageVisibility } from "../../../hooks/usePageVisibility.js";
import { useCategoricalGrossSales } from "./category-page/hooks/useCategoricalGrossSales.js";
import { PaymentContext } from "../../../context/PaymentContext.jsx";

export function CategoryPage() {
  const { categoryName } = useParams();
  const isVisible = usePageVisibility();
  const { todaysPayments } = useContext(PaymentContext);
  console.log(todaysPayments);

  // The component is now much cleaner. All the complex logic is in the hook.
  const { grossSales, syncWithServer, error } =
    useCategoricalGrossSales(categoryName);

  // This effect now only manages the Supabase real-time subscription.
  useEffect(() => {
    // This is the callback that runs when a change is detected in the database.
    const handleDatabaseChange = () => {
      console.log("Supabase change detected, triggering background sync...");
      syncWithServer();
    };

    // Perform an initial sync when the component mounts or becomes visible
    // to ensure the data is accurate from the start.
    if (isVisible) {
      syncWithServer();
    }

    const channel = supabase
      .channel(`public:transactions:${categoryName}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        handleDatabaseChange
      );

    if (isVisible) {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryName, isVisible, syncWithServer]);

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Category: {categoryName}
      </h1>
      <p className="text-gray-600 mb-6">
        Sales and logs for the current category.
      </p>

      {/* A small warning can be shown if the background sync fails. */}
      {error && (
        <p className="text-yellow-600 text-center text-sm mb-4">
          Warning: {error}
        </p>
      )}

      {/* The loading state is gone! The SalesSummaryCard renders instantly 
        with the value from the local context.
      */}
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
