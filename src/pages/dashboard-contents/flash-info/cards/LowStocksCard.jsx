import React, { useState, useEffect, useCallback } from "react";
import { MiniCard } from "../MiniCard";

import { io } from "socket.io-client";
import { FaCog, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../../../../features/pos-features/authentication/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function LowStocksCard({ onHide }) {
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(5); // Default limit
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
        setItems([]); // Clear items on error
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Initial fetch and fetch when limit changes
  useEffect(() => {
    fetchLowStocks(limit);
  }, [fetchLowStocks, limit]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = io(BACKEND_URL);

    // Your server already emits 'inventory_update'
    socket.on("inventory_update", () => {
      console.log("LowStocksCard: Received 'inventory_update', refetching.");
      fetchLowStocks(limit);
    });

    return () => socket.disconnect();
  }, [fetchLowStocks, limit]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setIsMenuOpen(false); // Close menu after selection
  };

  return (
    <div className="relative w-full h-full">
      {/* FIX: Pass the onHide prop down to the MiniCard component */}
      <MiniCard title="Low Stocks" value="" onHide={onHide}>
        <div
          className="absolute top-1 right-8 p-1 text-gray-400 hover:text-white cursor-pointer"
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
        <div className="absolute top-10 right-0 z-30 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 w-28 text-white">
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
