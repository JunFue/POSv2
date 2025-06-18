import React from "react";
import { Routes, Route } from "react-router";
import { Overview } from "./dashboard-contents/Overview";
import { MonthlyTable } from "./dashboard-contents/MonthlyTable";

export function Dashboard() {
  return (
    <div className="w-full h-full custom-gradient rounded-lg border border-accent-800 shadow-md p-4">
      {/* Nested Routing */}
      <Routes>
        <Route index element={<Overview />} />
        <Route path="monthly" element={<MonthlyTable />} />
      </Routes>
    </div>
  );
}
