import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardCard } from "./DashboardCard";
import { FlashInfo } from "./FlashInfo";
import { DailyReport } from "./DailyReport";
import { CashoutReport } from "./CashoutReport";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const initialCards = [
  { id: "1", title: "Flash Info", component: <FlashInfo /> },
  { id: "2", title: "Daily Report", component: <DailyReport /> },
  { id: "3", title: "Cashout Report", component: <CashoutReport /> },
];

// Function to generate the initial layout for the cards
const generateLayout = () => {
  return initialCards.map((card, index) => ({
    i: card.id,
    x: (index * 4) % 12, // Initial x position
    y: 0, // Initial y position
    w: 4, // Default width
    h: 4, // Default height
  }));
};

export function Dashboard() {
  const [layouts, setLayouts] = useState({ lg: generateLayout() });

  // This function is called when the layout changes, and it updates the state.
  const handleLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={70}
      onLayoutChange={handleLayoutChange}
    >
      {initialCards.map((card) => (
        // The extra div has been removed.
        // DashboardCard is now the direct child and receives the correct styles.
        <DashboardCard key={card.id} title={card.title}>
          {card.component}
        </DashboardCard>
      ))}
    </ResponsiveGridLayout>
  );
}
