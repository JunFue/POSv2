import React from "react";
import { Routes, Route } from "react-router";
import { Overview } from "./dashboard-contents/Overview";
import { MonthlyTable } from "./dashboard-contents/MonthlyTable";

export function Dashboard() {
  return (
    <div className="w-full h-full border text-[2vw] bg-gray-50">
      {/* Nested Routing */}
      <Routes>
        <Route index element={<Overview />} />
        <Route path="monthly" element={<MonthlyTable />} />
      </Routes>
    </div>
  );
}
