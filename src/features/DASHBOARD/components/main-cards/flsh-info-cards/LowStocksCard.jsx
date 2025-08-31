import React, { useState, useEffect, useCallback } from "react";

import { FaCog, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient";
import { MiniCard } from "./MiniCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CACHE_KEY = "lowStocks";

export function LowStocksCard({ onHide }) {
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(true); // Will now be handled more carefully
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchLowStocks = useCallback(
    async (currentLimit) => {
      if (!token) return;
      // --- FIXED: Do not set loading to true here ---
      try {
        const url = `${BACKEND_URL}/api/flash-info/low-stocks?limit=${currentLimit}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        setItems(data);
        // Cache the new list of items
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("LowStocksCard: Error fetching data:", error);
        setItems([]); // Clear items on error
      } finally {
        // --- NEW: Always set loading to false after a fetch attempt ---
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    // Load from cache on first mount
    const cachedItems = localStorage.getItem(CACHE_KEY);
    if (cachedItems) {
      setItems(JSON.parse(cachedItems));
      // If we have cached items, we are not in an initial loading state.
      setIsLoading(false);
    }

    // Fetch latest data
    fetchLowStocks(limit);

    // Subscribe to real-time changes
    const channel = supabase
      .channel("public:item_inventory:low_stocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_inventory" },
        () => {
          fetchLowStocks(limit);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLowStocks, limit]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative w-full h-full">
      <MiniCard title="Low Stocks" value="" onHide={onHide}>
        <div
          className="absolute top-1 right-8 p-1 text-gray-400 hover:text-body-text cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaCog size={12} />
        </div>

        <div className="mt-2 text-sm text-gray-200 overflow-y-auto h-full">
          {isLoading ? (
            <p>Loading...</p>
          ) : items.length > 0 ? (
            <ul>
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-xs py-1"
                >
                  <span>{item.item_name}</span>
                  <span className="font-bold text-yellow-400">
                    {item.quantity_available}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              <FaExclamationTriangle className="mr-2" />
              <span>No items to display.</span>
            </div>
          )}
        </div>
      </MiniCard>

      {isMenuOpen && (
        <div className="absolute top-10 right-0 z-30 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 w-28 text-body-text">
          <p className="text-xs font-bold text-center mb-2">Show Items</p>
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => handleLimitChange(num)}
                className={`p-1 text-xs rounded-md ${
                  limit === num
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
