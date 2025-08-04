import { Routes, Route, Navigate } from "react-router";
import { ItemRegForm } from "./inventory-contents/item-reg/ItemRegForms";
import { ItemRegTable } from "./inventory-contents/item-reg/ItemRegTable";
import { Stocks } from "./inventory-contents/stocks-management/Stocks";
import { StocksMonitor } from "./inventory-contents/stocks-monitor/StocksMonitor";
// --- Step 1: Remove the import for RefreshButton ---
// import { RefreshButton } from "./inventory-contents/item-reg/RefreshButton";

export function Inventory() {
  return (
    <div className="w-full h-fit rounded-lg shadow-neumorphic p-[0.3vw] text-[2vw]">
      <Routes>
        <Route
          path="item-registration"
          element={
            <>
              <div className="flex font-bold text-[1.7vw] items-center flex-row w-full justify-between px-[1vw] h-[6vh] rounded-lg border border-gray-400 shadow-inner">
                <div className="m-auto">Item Registration</div>
              </div>
              <div className="flex flex-col w-full h-full gap-[1vw]">
                <ItemRegForm />
                {/* --- Step 2: Remove the RefreshButton component usage --- */}
                <ItemRegTable />
              </div>
            </>
          }
        />
        <Route
          path="stocks-management"
          element={
            <>
              <div className="flex text-[1.7vw] flex-row w-full justify-between px-[2vw] h-[4vw] rounded-lg p-[0.3vw]">
                <div className="font-bold">Stocks Management</div>
              </div>

              <Stocks />
            </>
          }
        />
        <Route path="stocks-monitor" element={<StocksMonitor />} />
        <Route path="*" element={<Navigate to="item-registration" replace />} />
      </Routes>
    </div>
  );
}
