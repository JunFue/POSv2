import { useContext } from "react";
import dayjs from "dayjs";
import { StocksMgtContext } from "../../../context/StocksManagement";
import { ItemRegData } from "../../../context/ItemRegContext";

export function StocksMonitor() {
  const { stockRecords } = useContext(StocksMgtContext);
  const { items } = useContext(ItemRegData);

  // Get unique item names from the Item Registration Table
  const uniqueItemNames = Array.from(new Set(items.map((item) => item.name)));

  // Helper to get net current quantity for an item
  const getNetQuantity = (itemName) => {
    const filtered = stockRecords.filter(
      (r) => r.item.toLowerCase() === itemName.toLowerCase()
    );
    const stockIn = filtered
      .filter((r) => r.stockFlow === "Stock In")
      .reduce((sum, r) => sum + r.quantity, 0);
    const stockOut = filtered
      .filter((r) => r.stockFlow === "Stock Out")
      .reduce((sum, r) => sum + r.quantity, 0);
    return stockIn - stockOut;
  };

  // Helper to get last restock date (most recent 'Stock In') for an item
  const getLastRestockDate = (itemName) => {
    const dates = stockRecords
      .filter(
        (r) =>
          r.item.toLowerCase() === itemName.toLowerCase() &&
          r.stockFlow === "Stock In"
      )
      .map((r) => r.date);
    if (dates.length === 0) return "N/A";
    // Use dayjs to get the latest date
    const lastDate = dates.reduce((latest, date) =>
      dayjs(date).isAfter(dayjs(latest)) ? date : latest
    );
    return lastDate;
  };

  return (
    <div className="mt-4 overflow-x-auto h-fit max-w-full">
      <table className="min-w-full border-collapse table-auto text-[0.8vw]">
        <thead>
          <tr>
            <th className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-left">
              Item Name
            </th>
            <th className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-left">
              Current Stock Quantity
            </th>
            <th className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-left">
              Last Restock Date
            </th>
          </tr>
        </thead>
        <tbody>
          {uniqueItemNames.map((name, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border-b border-gray-300 px-4 py-2">{name}</td>
              <td className="border-b border-gray-300 px-4 py-2">
                {getNetQuantity(name)}
              </td>
              <td className="border-b border-gray-300 px-4 py-2">
                {getLastRestockDate(name)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
