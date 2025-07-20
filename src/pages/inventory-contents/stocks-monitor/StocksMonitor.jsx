import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import { useAuth } from "../../../features/pos-features/authentication/hooks/Useauth";
// 1. --- Import the useAuth hook ---

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function StocksMonitor() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. --- Get the session from the context via the hook ---
  const { session } = useAuth();

  useEffect(() => {
    // This function will now be defined inside the useEffect
    // to have access to the `session` from the hook.
    const fetchInitialInventory = async () => {
      // 3. --- Check if the session and token exist before fetching ---
      if (!session?.access_token) {
        // Don't try to fetch if the user isn't logged in.
        // You might want to set an error or just show nothing.
        setError("You must be logged in to view inventory.");
        setLoading(false);
        return;
      }

      try {
        // No need to set loading(true) here as it's set initially
        const response = await fetch(`${BACKEND_URL}/api/inventory`, {
          headers: {
            // 4. --- Use the token from the session provided by the hook ---
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Network response was not ok");
        }

        const data = await response.json();
        setInventory(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching initial inventory:", err);
        setError(err.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialInventory();

    const socket = io(BACKEND_URL);

    socket.on("inventory_update", (updatedItem) => {
      console.log("Received real-time update:", updatedItem);
      setInventory((prevInventory) => {
        const itemIndex = prevInventory.findIndex(
          (item) => item.id === updatedItem.id
        );

        if (itemIndex > -1) {
          const newInventory = [...prevInventory];
          newInventory[itemIndex] = updatedItem;
          return newInventory;
        } else {
          const newInventory = [...prevInventory, updatedItem];
          return newInventory.sort((a, b) =>
            a.item_name.localeCompare(b.item_name)
          );
        }
      });
    });

    return () => {
      socket.disconnect();
    };
    // 5. --- Add `session` as a dependency ---
    // This ensures the effect re-runs if the user logs in or out.
  }, [session]);

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
