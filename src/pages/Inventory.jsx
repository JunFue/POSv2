import { Routes, Route, Navigate } from "react-router-dom";
import { ItemRegForm } from "./inventory-contents/item-reg/ItemRegForms";
import { ItemRegTable } from "./inventory-contents/item-reg/ItemRegTable";
import { Stocks } from "./inventory-contents/stocks-management/Stocks";

export function Inventory({ items, setItems }) {
  return (
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
                <ItemRegForm items={items} setItems={setItems} />
                <ItemRegTable items={items} setItems={setItems} />
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
              <Stocks items={items} setItems={setItems} />
            </>
          }
        />
        <Route
          path="stocks-monitor"
          element={
            <>
              <div
                style={{ background: "black", width: "100%", height: "100%" }}
              >
                {/* Stocks Monitor placeholder */}
              </div>
              <div className="text-[0.8vw] p-[0.5vw]">
                File: StocksMonitor.jsx
              </div>
            </>
          }
        />
        <Route path="*" element={<Navigate to="item-registration" replace />} />
      </Routes>
    </div>
  );
}
