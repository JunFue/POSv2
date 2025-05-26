import { useState } from "react";
import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";

export function Stocks({ items = [] }) {
  const [stockRecords, setStockRecords] = useState([]);
  const addRecord = (record) => {
    setStockRecords((prev) => [...prev, record]);
  };

  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-[#f9f9f9] rounded-lg shadow-md">
      <StocksForm items={items} onRecord={addRecord} />
      <StocksTable records={stockRecords} />
    </div>
  );
}
