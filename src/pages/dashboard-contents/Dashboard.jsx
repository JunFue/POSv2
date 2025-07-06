import React from "react";
import { DashboardCard } from "./DashboardCard";
import { FlashInfo } from "./FlashInfo";
import { DailyReport } from "./DailyReport";
import { CashoutReport } from "./CashoutReport";

export function Dashboard() {
  return (
    <div className="w-full h-full custom-gradient rounded-lg border border-accent-800 shadow-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Flash Info */}
        <DashboardCard
          title="Flash Info"
          initialWidth={500}
          initialHeight={350}
        >
          <FlashInfo />
        </DashboardCard>

        {/* Card 2: Daily Report */}
        <DashboardCard
          title="Daily Report"
          initialWidth={400}
          initialHeight={350}
        >
          <DailyReport />
        </DashboardCard>

        {/* Card 3: Cashout Report */}
        <DashboardCard
          title="Cashout Report"
          initialWidth={400}
          initialHeight={350}
        >
          <CashoutReport />
        </DashboardCard>
      </div>
    </div>
  );
}
