import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardCard } from "./DashboardCard";
import { FlashInfo } from "./flash-info/FlashInfo";
import { DailyReport } from "./DailyReport";
import { CashoutReport } from "./cashout-report/CashoutReport";
import { CashFlow } from "./CashFlow";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// A key to store and retrieve the layout from localStorage
const LAYOUT_STORAGE_KEY = "dashboard-layouts-v1";

const initialCards = [
  { id: "1", title: "Flash Info", component: <FlashInfo /> },
  { id: "2", title: "Daily Report", component: <DailyReport /> },
  { id: "3", title: "Cashout Report", component: <CashoutReport /> },
  { id: "4", title: "Cash Flow", component: <CashFlow /> },
];

// This function generates the default layout if none is saved
const generateLayout = () => {
  return initialCards.map((card, index) => ({
    i: card.id,
    x: (index * 4) % 12,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 5,
  }));
};

export function Dashboard() {
  // The state now attempts to load from localStorage on initial render
  const [layouts, setLayouts] = useState(() => {
    try {
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return savedLayouts ? JSON.parse(savedLayouts) : { lg: generateLayout() };
    } catch (error) {
      console.error("Error loading layout from localStorage:", error);
      return { lg: generateLayout() };
    }
  });

  // This function now saves the new layout to localStorage on every change
  const handleLayoutChange = (layout, allLayouts) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
      setLayouts(allLayouts);
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
    }
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={70}
      onLayoutChange={handleLayoutChange}
      // This prop specifies that dragging can only be initiated from the header.
      draggableHandle=".drag-handle"
    >
      {initialCards.map((card) => (
        <DashboardCard key={card.id} title={card.title}>
          {card.component}
        </DashboardCard>
      ))}
    </ResponsiveGridLayout>
  );
}
