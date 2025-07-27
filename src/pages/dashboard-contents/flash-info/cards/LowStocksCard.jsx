import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";
import { FaCog, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";
import { supabase } from "../../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function LowStocksCard({ onHide }) {
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchLowStocks = useCallback(
    async (currentLimit) => {
      if (!token) return;
      setIsLoading(true);

      try {
        const url = `${BACKEND_URL}/api/flash-info/low-stocks?limit=${currentLimit}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("LowStocksCard: Error fetching data:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchLowStocks(limit);

    // --- REVISED: Supabase Real-time Subscription ---
    const channel = supabase
      .channel("public:item_inventory:low_stocks") // Use a unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_inventory" },
        () => {
          console.log("LowStocksCard: Inventory change detected, refetching.");
          fetchLowStocks(limit);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
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
