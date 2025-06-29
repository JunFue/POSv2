import { useContext, useCallback } from "react";
import { StocksMgtContext } from "../../../context/StocksManagement";

export const useStockManager = () => {
  const { stockRecords } = useContext(StocksMgtContext);

  const getNetQuantity = useCallback(
    (itemName) => {
      if (!stockRecords || stockRecords.length === 0) {
        return "N/A";
      }

      const filtered = stockRecords.filter(
        (r) => r.item.toLowerCase() === itemName.toLowerCase()
      );

      if (filtered.length === 0) {
        return "N/A";
      }

      const stockIn = filtered
        .filter((r) => r.stockFlow === "Stock In")
        .reduce((sum, r) => sum + r.quantity, 0);

      const stockOut = filtered
        .filter((r) => r.stockFlow === "Stock Out")
        .reduce((sum, r) => sum + r.quantity, 0);

      return stockIn - stockOut;
    },
    [stockRecords]
  );

  return { getNetQuantity };
};
