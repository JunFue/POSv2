import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { SalesSummaryCard } from "./SalesSummaryCard.jsx";
import { ItemsSoldTable } from "./ItemSoldTable.jsx";
import { MonthlyLogTable } from "./MonthlyLogTable.jsx";
import { useAuth } from "../../AUTHENTICATION/hooks/useAuth.js";
import { supabase } from "../../../utils/supabaseClient.js";
import { usePageVisibility } from "../../../hooks/usePageVisibility.js";
import { getCategoricalSales } from "../../../api/categoryPageService.js";

const CACHE_TTL_MS = 5 * 60 * 1000;

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
);

export function CategoryPage() {
  const { categoryName } = useParams();
  const { user } = useAuth(); // We don't need the token directly anymore
  const isVisible = usePageVisibility();

  const today = new Date().toISOString().split("T")[0];
  const CACHE_KEY = `categoricalSales-${categoryName}-${today}`;

  const [summaryData, setSummaryData] = useState({ grossSales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataForCategory, setDataForCategory] = useState(null);

  const fetchGrossSales = useCallback(async () => {
    if (!categoryName || !user?.id) return;

    try {
      // This function call remains the same, but the underlying service now hits the correct URL
      const result = await getCategoricalSales(today, categoryName, user.id);

      const newGrossSales = result.totalSales;
      setSummaryData({ grossSales: newGrossSales });
      setDataForCategory(categoryName);

      const cacheData = { value: newGrossSales, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryName, user, today, CACHE_KEY]);

  const debouncedFetchRef = useRef(debounce(fetchGrossSales, 500));

  useEffect(() => {
    setLoading(true);
    setError(null);

    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setSummaryData({ grossSales: value });
        setDataForCategory(categoryName);
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchGrossSales();
    }

    const channel = supabase
      .channel(`public:transactions:${categoryName}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          debouncedFetchRef.current();
        }
      );

    if (isVisible) channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryName, fetchGrossSales, isVisible, CACHE_KEY, user]);

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

      {!loading && !error && dataForCategory === categoryName && (
        <>
          <SalesSummaryCard data={summaryData} />
          <ItemsSoldTable data={[]} />
          <MonthlyLogTable data={[]} />
        </>
      )}
    </div>
  );
}
