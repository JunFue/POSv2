import { Routes, Route, Navigate } from "react-router";
import { StocksMonitor } from "./stocks-monitor/StocksMonitor";
// --- FIX: Import the stable page components for all routes ---
import { ItemRegistrationPage } from "./ItemRegistrationPage";
import { StocksManagementPage } from "./stocks-management/StocksManagementPage";

export function Inventory() {
  return (
    <div className="w-full h-fit rounded-lg shadow-neumorphic p-[0.3vw] text-[2vw]">
      <Routes>
        {/* --- FIX: Use a stable component for each route's element prop --- */}
        <Route path="item-registration" element={<ItemRegistrationPage />} />
        <Route path="stocks-management" element={<StocksManagementPage />} />
        <Route path="stocks-monitor" element={<StocksMonitor />} />
        <Route path="*" element={<Navigate to="item-registration" replace />} />
      </Routes>
    </div>
  );
}
i;
