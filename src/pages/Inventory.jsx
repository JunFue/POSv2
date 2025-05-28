import { Routes, Route, Navigate } from "react-router-dom";
import { ItemRegForm } from "./inventory-contents/item-reg/ItemRegForms";
import { ItemRegTable } from "./inventory-contents/item-reg/ItemRegTable";
import { Stocks } from "./inventory-contents/stocks-management/Stocks";
import { StocksMgtProvider } from "../context/StocksManagement";
import { StocksMonitor } from "./inventory-contents/stocks-monitor/StocksMonitor";

export function Inventory() {
  return (
    <StocksMgtProvider>
      <div className="w-full h-full rounded-lg border border-gray-400 shadow-inner p-[0.3vw] text-[2vw]">
        <Routes>
          <Route
            path="item-registration"
            element={
              <>
                <div className="flex text-[1.7vw] flex-row w-full justify-between px-[2vw] h-[4vw] rounded-lg border border-gray-400 shadow-inner p-[0.3vw]">
                  <div>Item Registration</div>
                </div>
                <div className="text-[0.8vw] p-[0.5vw]">
                  Files: ItemRegForms.jsx, ItemRegTable.jsx
                </div>
                <div className="flex flex-col w-full h-full gap-[1vw]">
                  <ItemRegForm />
                  <ItemRegTable />
                </div>
              </>
            }
          />
          <Route
            path="stocks-management"
            element={
              <>
                <div className="flex text-[1.7vw] flex-row w-full justify-between px-[2vw] h-[4vw] rounded-lg border border-gray-400 shadow-inner p-[0.3vw]">
                  <div>Stocks Management</div>
                </div>
                <div className="text-[0.8vw] p-[0.5vw]">
                  Files: Stocks.jsx, StocksForm.jsx, StocksTable.jsx
                </div>
                <Stocks />
              </>
            }
          />
          <Route path="stocks-monitor" element={<StocksMonitor />} />
          <Route
            path="*"
            element={<Navigate to="item-registration" replace />}
          />
        </Routes>
      </div>
    </StocksMgtProvider>
  );
}
