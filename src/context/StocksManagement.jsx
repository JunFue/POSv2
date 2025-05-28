import React, { createContext, useState, useEffect } from "react";

const StocksMgtContext = createContext();

export function StocksMgtProvider({ children }) {
  const [stockRecords, setStockRecords] = useState(() => {
    const storedRecords = localStorage.getItem("stockRecords");
    return storedRecords ? JSON.parse(storedRecords) : [];
  });

  useEffect(() => {
    localStorage.setItem("stockRecords", JSON.stringify(stockRecords));
  }, [stockRecords]);

  return (
    <StocksMgtContext.Provider value={{ stockRecords, setStockRecords }}>
      {children}
    </StocksMgtContext.Provider>
  );
}

export { StocksMgtContext };
