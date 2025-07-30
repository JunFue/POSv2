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
  const { token } = useAuth(); // Use your custom hook to get the auth token

  // State to hold all summary card data. Initialize with default values.
  const [summaryData, setSummaryData] = useState({
    grossSales: 0,
    totalQuantitySold: 0, // Placeholder
    freeQuantity: 0, // Placeholder
    netQuantity: 0, // Placeholder
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrossSales = async () => {
      // Only proceed if we have the necessary information
      if (!categoryName || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      try {
        const response = await fetch("/api/categorical-report/daily-sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use the token from the useAuth hook
          },
          body: JSON.stringify({
            date: today,
            category: categoryName,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        // Update only the grossSales field with the fetched data
        setSummaryData((prevData) => ({
          ...prevData,
          grossSales: result.totalSales,
        }));
      } catch (err) {
        console.error("Error fetching gross sales:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrossSales();
  }, [categoryName, token]); // Add token to the dependency array

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Category: {categoryName}
      </h1>
      <p className="text-gray-600 mb-6">
        Sales and logs for the current category.
      </p>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* SalesSummaryCard now uses state with the fetched gross sales */}
          <SalesSummaryCard data={summaryData} />

          {/* The components below are given empty data until their endpoints are created */}
          <ItemsSoldTable data={[]} />
          <MonthlyLogTable data={[]} />
        </>
      )}
    </div>
  );
}
