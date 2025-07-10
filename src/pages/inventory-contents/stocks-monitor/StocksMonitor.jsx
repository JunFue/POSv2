import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
// You'll need to install socket.io-client: npm install socket.io-client
import { io } from "socket.io-client";

// The URL of your backend server
const BACKEND_URL = "http://localhost:3000"; // Your backend is on port 3000

export function StocksMonitor() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // --- 1. Initial Data Fetch from Backend API ---
    const fetchInitialInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/inventory`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        console.error("Error fetching initial inventory:", err);
        setError("Failed to load inventory. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialInventory();

    // --- 2. Establish WebSocket Connection ---
    const socket = io(BACKEND_URL);

    // --- 3. Listen for Real-time Updates ---
    socket.on("inventory_update", (updatedItem) => {
      console.log("Received real-time update:", updatedItem);
      setInventory((prevInventory) => {
        // Find if the item already exists in our list
        const itemIndex = prevInventory.findIndex(
          (item) => item.id === updatedItem.id
        );

        if (itemIndex > -1) {
          // If it exists, update it
          const newInventory = [...prevInventory];
          newInventory[itemIndex] = updatedItem;
          return newInventory;
        } else {
          // If it's a new item, add it and re-sort
          const newInventory = [...prevInventory, updatedItem];
          return newInventory.sort((a, b) =>
            a.item_name.localeCompare(b.item_name)
          );
        }
      });
    });

    // --- 4. Cleanup ---
    // Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center">Loading stock levels from server...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
              Item Name
            </th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
              Stocks Available
            </th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
              Recent Restock Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {inventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                {item.item_name}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                <span
                  className={
                    item.quantity_available <= 10
                      ? "font-bold text-red-600"
                      : ""
                  }
                >
                  {item.quantity_available}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {item.last_restock_date
                  ? dayjs(item.last_restock_date).format("MMMM D, YYYY")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
