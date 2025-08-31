import React from "react";
import dayjs from "dayjs";
import { useInventory } from "../../../context/InventoryContext";

/**
 * A component that displays the current inventory levels in a table.
 * It consumes the shared inventory state from the `InventoryContext`.
 */
export function StocksMonitor() {
  // Get shared state (inventory data, loading status, errors) from the new context.
  const { inventory, loading, error } = useInventory();

  // Display a loading message while data is being fetched.
  if (loading) {
    return (
      <div className="p-4 text-center">Loading stock levels from server...</div>
    );
  }

  // Display an error message if fetching failed.
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // Render the inventory table.
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-background">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-head-text">
              Item Name
            </th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-head-text">
              Stocks Available
            </th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-head-text">
              Recent Restock Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-background">
          {inventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-2 font-medium text-head-text">
                {item.item_name}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-body-text">
                <span
                  className={
                    // Highlight stock level if it's 10 or less.
                    item.quantity_available <= 10
                      ? "font-bold text-red-600"
                      : ""
                  }
                >
                  {item.quantity_available}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-body-text">
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
