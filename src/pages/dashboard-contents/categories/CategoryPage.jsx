import React, { useState, useEffect } from "react";
import { useParams } from "react-router";

import { SalesSummaryCard } from "./components/SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./components/ItemSoldTable.jsx";
import { MonthlyLogTable } from "./components/MonthlyLogTable.jsx";
import { useAuth } from "../../../features/pos-features/authentication/hooks/useAuth.js";

// A simple loading component to improve user experience
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
);

export function CategoryPage() {
  const { categoryName } = useParams();
  const { token, user } = useAuth();

  const [summaryData, setSummaryData] = useState({
    grossSales: 0,
    totalQuantitySold: 0,
    freeQuantity: 0,
    netQuantity: 0,
  });
  // Start in a loading state by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrossSales = async () => {
      if (!categoryName || !token || !user?.id) {
        return;
      }

      setError(null);
      const today = new Date().toISOString().split("T")[0];

      try {
        const queryParams = new URLSearchParams({
          date: today,
          classification: categoryName,
          userId: user.id,
        });
        const url = `/api/categorical-sales?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        setSummaryData((prevData) => ({
          ...prevData,
          grossSales: result.totalSales,
        }));
      } catch (err) {
        console.error(
          "[DEBUG] An error occurred in the fetchGrossSales function:",
          err
        );
        setError(err.message);
      } finally {
        // Once the fetch is complete (or fails), stop loading.
        setLoading(false);
      }
    };

    fetchGrossSales();
  }, [categoryName, token, user]); // The effect runs when any of these change

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Category: {categoryName}
      </h1>
      <p className="text-gray-600 mb-6">
        Sales and logs for the current category.
      </p>

      {/* The loading spinner will now correctly display until the fetch is attempted */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      {!loading && !error && (
        <>
          <SalesSummaryCard data={summaryData} />
          <ItemsSoldTable data={[]} />
          <MonthlyLogTable data={[]} />
        </>
      )}
    </div>
  );
}
